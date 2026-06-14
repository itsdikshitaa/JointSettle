import { logActivity, randomId } from '@/lib/api'
import { verifyUserAuthenticated } from '@/lib/auth'
import { getCurrency } from '@/lib/currency'
import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { ActivityType, RecurrenceRule } from '@prisma/client'
import Papa from 'papaparse'
import { z } from 'zod'

// Map the export split mode labels back to enum values
const splitModeLabelReverse: Record<string, 'EVENLY' | 'BY_SHARES' | 'BY_PERCENTAGE' | 'BY_AMOUNT'> = {
  'Evenly': 'EVENLY',
  'Unevenly – By shares': 'BY_SHARES',
  'Unevenly – By percentage': 'BY_PERCENTAGE',
  'Unevenly – By amount': 'BY_AMOUNT',
}

// Flexible column name matching
const COLUMN_ALIASES: Record<string, string> = {
  'date': 'date',
  'description': 'title',
  'title': 'title',
  'category': 'category',
  'currency': 'currency',
  'cost': 'amount',
  'amount': 'amount',
  'original cost': 'originalCost',
  'original amount': 'originalAmount',
  'original currency': 'originalCurrency',
  'conversion rate': 'conversionRate',
  'rate': 'conversionRate',
  'is reimbursement': 'isReimbursement',
  'reimbursement': 'isReimbursement',
  'split mode': 'splitMode',
  'split': 'splitMode',
}

function normalizeHeader(header: string): string {
  return COLUMN_ALIASES[header.toLowerCase().trim()] || header
}

export const importCsvExpensesProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      hash: z.string().length(8),
      csvContent: z.string().min(1),
    }),
  )
  .mutation(async ({ input: { groupId, hash, csvContent } }) => {
    const isAuthenticated = await verifyUserAuthenticated(hash)
    if (!isAuthenticated) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    }

    // Get group with participants
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { participants: true },
    })
    if (!group) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found' })
    }

    // Parse CSV
    const parsed = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
    })

    if (parsed.errors.length > 0) {
      console.error('CSV parse errors:', parsed.errors)
    }

    if (parsed.data.length === 0) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'CSV file is empty or has no valid rows' })
    }

    // Detect participant columns (columns not in our known headers)
    const rawHeaders = Papa.parse(csvContent, { header: false, preview: 1 }).data[0] as string[]
    const knownHeaders = new Set(Object.values(COLUMN_ALIASES))
    const knownHeaderKeys = new Set(Object.keys(COLUMN_ALIASES))
    const participantColumns = rawHeaders.filter((h: string) => {
      const normalized = h.toLowerCase().trim()
      return !knownHeaderKeys.has(normalized) && !knownHeaders.has(normalized)
    })

    const categories = await prisma.category.findMany()
    const categoryMap = new Map<string, number>()
    for (let catIdx = 0; catIdx < categories.length; catIdx++) {
      const cat = categories[catIdx]
      categoryMap.set(cat.name.toLowerCase(), cat.id)
      categoryMap.set(`${cat.grouping.toLowerCase()}/${cat.name.toLowerCase()}`, cat.id)
    }

    // Get currency info for decimal handling
    const currencyInfo = group.currencyCode
      ? getCurrency(group.currencyCode)
      : { decimal_digits: 2, symbol: '$', code: '' }

    const results: { success: number; errors: string[] } = { success: 0, errors: [] }

    for (let rowIndex = 0; rowIndex < parsed.data.length; rowIndex++) {
      const row = parsed.data[rowIndex]
      try {
        const rowNum = rowIndex + 2 // 1-indexed + header row

        // Parse date
        const dateStr = row.date || ''
        if (!dateStr) {
          results.errors.push(`Row ${rowNum}: Missing date`)
          continue
        }
        const expenseDate = new Date(dateStr)
        if (isNaN(expenseDate.getTime())) {
          results.errors.push(`Row ${rowNum}: Invalid date "${dateStr}"`)
          continue
        }

        // Parse title
        const title = (row.title || '').trim()
        if (!title || title.length < 2) {
          results.errors.push(`Row ${rowNum}: Missing or too short title`)
          continue
        }

        // Parse amount
        const amountRaw = parseFloat(row.amount as string)
        if (isNaN(amountRaw) || amountRaw <= 0) {
          results.errors.push(`Row ${rowNum}: Invalid amount "${row.amount}"`)
          continue
        }
        const amount = Math.round(amountRaw * Math.pow(10, currencyInfo.decimal_digits))

        // Parse category
        const categoryName = (row.category || '').trim().toLowerCase()
        let categoryId = 0 // Default to General
        if (categoryName) {
          categoryId = categoryMap.get(categoryName) ?? 0
        }

        // Parse split mode
        let splitMode: 'EVENLY' | 'BY_SHARES' | 'BY_PERCENTAGE' | 'BY_AMOUNT' = 'EVENLY'
        if (row.splitMode) {
          const normalized = row.splitMode.trim()
          splitMode = splitModeLabelReverse[normalized] || 'EVENLY'
        }

        // Parse isReimbursement
        const isReimbursement = row.isReimbursement === 'Yes' || row.isReimbursement === 'true'

        // Determine who paid and who it's for using participant columns
        let paidById: string | null = null
        const paidForEntries: { participantId: string; shares: number }[] = []

        if (participantColumns.length > 0) {
          // Use participant columns from CSV to determine split
          for (let colIdx = 0; colIdx < participantColumns.length; colIdx++) {
            const colName = participantColumns[colIdx]
            const value = parseFloat(row[colName] as string)
            if (isNaN(value)) continue

            // Find the participant by name
            const participant = group.participants.find(
              (p) => p.name.toLowerCase() === colName.toLowerCase().trim(),
            )
            if (!participant) {
              results.errors.push(`Row ${rowNum}: Participant "${colName}" not found in group`)
              continue
            }

            const absValue = Math.abs(value)

            if (value > 0) {
              // Positive = this person paid (the payer)
              paidById = participant.id
            }

            if (paidForEntries.length < group.participants.length) {
              let shares = 0
              switch (splitMode) {
                case 'EVENLY':
                  shares = 1
                  break
                case 'BY_AMOUNT':
                  shares = Math.round(absValue * Math.pow(10, currencyInfo.decimal_digits))
                  break
                case 'BY_PERCENTAGE':
                  shares = Math.round(absValue * 100)
                  break
                case 'BY_SHARES':
                  shares = Math.round(absValue)
                  break
              }
              paidForEntries.push({
                participantId: participant.id,
                shares: Math.max(1, shares),
              })
            }
          }

          // Fallback: If no payer found, assume the first participant paid
          if (!paidById && paidForEntries.length > 0) {
            paidById = paidForEntries[0].participantId
          }
        } else {
          // No participant columns - assume even split among all group participants
          if (group.participants.length === 0) {
            results.errors.push(`Row ${rowNum}: No participants in group`)
            continue
          }
          paidById = group.participants[0].id
          for (let pIdx = 0; pIdx < group.participants.length; pIdx++) {
            paidForEntries.push({ participantId: group.participants[pIdx].id, shares: 1 })
          }
        }

        if (!paidById) {
          results.errors.push(`Row ${rowNum}: Could not determine who paid`)
          continue
        }
        if (paidForEntries.length === 0) {
          results.errors.push(`Row ${rowNum}: Could not determine who the expense is for`)
          continue
        }

        // Parse optional fields
        let originalAmount: number | undefined
        let originalCurrency: string | undefined
        let conversionRate: number | undefined

        if (row.originalCost || row.originalAmount) {
          const oa = parseFloat((row.originalCost || row.originalAmount) as string)
          if (!isNaN(oa) && oa > 0) {
            originalAmount = Math.round(oa * 100)
          }
        }
        if (row.originalCurrency) {
          originalCurrency = (row.originalCurrency as string).trim()
        }
        if (row.conversionRate) {
          const cr = parseFloat(row.conversionRate as string)
          if (!isNaN(cr) && cr > 0) {
            conversionRate = cr
          }
        }

        const expenseId = randomId()

        // Create the expense
        await prisma.expense.create({
          data: {
            id: expenseId,
            groupId,
            expenseDate,
            title,
            categoryId,
            amount,
            originalAmount,
            originalCurrency,
            conversionRate,
            paidById,
            splitMode,
            isReimbursement,
            recurrenceRule: RecurrenceRule.NONE,
            paidFor: {
              createMany: {
                data: paidForEntries.map((entry) => ({
                  participantId: entry.participantId,
                  shares: entry.shares,
                })),
              },
            },
          },
        })

        // Log activity for the created expense
        await logActivity(groupId, ActivityType.CREATE_EXPENSE, {
          expenseId,
          data: title,
        })

        results.success++
      } catch (err) {
        const rowNum = rowIndex + 2
        results.errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    return results
  })
