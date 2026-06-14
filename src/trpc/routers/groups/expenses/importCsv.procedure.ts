import { logActivity, randomId } from '@/lib/api'
import { verifyUserAuthenticated } from '@/lib/auth'
import { getCurrency } from '@/lib/currency'
import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { ActivityType, RecurrenceRule } from '@prisma/client'
import Papa from 'papaparse'
import { z } from 'zod'
import {
  detectCsvFormat,
  parseDate,
  detectDateFormatInconsistency,
  findAmbiguousDates,
  parseAmount,
  hasExcessivePrecision,
  parseSplitDetails,
  parseSplitWith,
  mapSplitMode,
  findParticipant,
  findSimilarParticipant,
  isParticipantInactiveOnDate,
  createAnomaly,
  resetAnomalyCounter,
  EXPORT_SPLIT_MODE_MAP,
  type ImportResult,
  type Anomaly,
  type AmbiguousDateInfo,
} from '@/lib/csv-parser'

// ─── App Export Parser (keeps existing app-export format support) ────────

const EXPORT_COLUMN_ALIASES: Record<string, string> = {
  date: 'date',
  description: 'title',
  title: 'title',
  category: 'category',
  currency: 'currency',
  cost: 'amount',
  amount: 'amount',
  'original cost': 'originalCost',
  'original amount': 'originalAmount',
  'original currency': 'originalCurrency',
  'conversion rate': 'conversionRate',
  rate: 'conversionRate',
  'is reimbursement': 'isReimbursement',
  reimbursement: 'isReimbursement',
  'split mode': 'splitMode',
  split: 'splitMode',
}

function normalizeExportHeader(header: string): string {
  return EXPORT_COLUMN_ALIASES[header.toLowerCase().trim()] || header
}

async function parseAppExportCsv(
  rawCsv: string,
  group: {
    id: string
    currencyCode: string | null
    participants: Array<{ id: string; name: string }>
  },
  categories: Array<{ id: number; name: string; grouping: string }>,
): Promise<ImportResult> {
  const anomalies: Anomaly[] = []
  let imported = 0

  const parsed = Papa.parse<Record<string, string>>(rawCsv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeExportHeader,
  })

  const rawHeaders = Papa.parse(rawCsv, { header: false, preview: 1 }).data[0] as string[]
  const knownHeaders = new Set(Object.values(EXPORT_COLUMN_ALIASES))
  const knownHeaderKeys = new Set(Object.keys(EXPORT_COLUMN_ALIASES))

  // Detect participant columns (columns that aren't known headers)
  const participantColumns = rawHeaders.filter((h: string) => {
    const normalized = h.toLowerCase().trim()
    return (
      !knownHeaderKeys.has(normalized) &&
      !knownHeaders.has(normalized)
    )
  })

  const categoryMap = new Map<string, number>()
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci]
    categoryMap.set(cat.name.toLowerCase(), cat.id)
    categoryMap.set(`${cat.grouping.toLowerCase()}/${cat.name.toLowerCase()}`, cat.id)
  }

  const currencyInfo = group.currencyCode
    ? getCurrency(group.currencyCode)
    : { decimal_digits: 2, symbol: '$', code: '' }

  for (let rowIndex = 0; rowIndex < parsed.data.length; rowIndex++) {
    const row = parsed.data[rowIndex]
    const rowNum = rowIndex + 2

    try {
      // Parse date
      const dateStr = row.date || ''
      if (!dateStr) {
        anomalies.push(createAnomaly(rowNum, 'date', 'DATE_MISSING', 'error', 'skipped', 'Missing date'))
        continue
      }
      const expenseDate = new Date(dateStr)
      if (isNaN(expenseDate.getTime())) {
        anomalies.push(createAnomaly(rowNum, 'date', 'DATE_UNPARSEABLE', 'error', 'skipped', `Invalid date "${dateStr}"`))
        continue
      }

      // Parse title
      const title = (row.title || '').trim()
      if (!title || title.length < 2) {
        anomalies.push(createAnomaly(rowNum, 'title', 'TITLE_MISSING', 'error', 'skipped', 'Missing or too short title'))
        continue
      }

      // Parse amount
      const amountRaw = row.amount as string
      const amountParsed = parseAmount(amountRaw || '')
      if (!amountParsed || amountParsed.value <= 0) {
        anomalies.push(createAnomaly(rowNum, 'amount', 'AMOUNT_INVALID', 'error', 'skipped', `Invalid amount "${amountRaw}"`))
        continue
      }
      const amount = Math.round(amountParsed.value * Math.pow(10, currencyInfo.decimal_digits))

      // Category
      const categoryName = (row.category || '').trim().toLowerCase()
      const categoryId = categoryName ? (categoryMap.get(categoryName) ?? 0) : 0

      // Split mode
      let splitMode: 'EVENLY' | 'BY_SHARES' | 'BY_PERCENTAGE' | 'BY_AMOUNT' = 'EVENLY'
      if (row.splitMode) {
        splitMode = EXPORT_SPLIT_MODE_MAP[row.splitMode.trim().toLowerCase()] || 'EVENLY'
      }

      // Reimbursement
      const isReimbursement = row.isReimbursement === 'Yes' || row.isReimbursement === 'true'

      // Determine payer and split from participant columns
      let paidById: string | null = null
      const paidForEntries: Array<{ participantId: string; shares: number }> = []

      if (participantColumns.length > 0) {
        for (let ci = 0; ci < participantColumns.length; ci++) {
          const colName = participantColumns[ci]
          const value = parseFloat(row[colName] as string)
          if (isNaN(value)) continue

          const participant = findParticipant(colName, group.participants)
          if (!participant) {
            anomalies.push(createAnomaly(rowNum, colName, 'PARTICIPANT_UNKNOWN', 'warning', 'skipped', `Participant "${colName}" not found in group`))
            continue
          }

          const absValue = Math.abs(value)
          if (value > 0) paidById = participant.id

          let shares = 1
          switch (splitMode) {
            case 'EVENLY': shares = 1; break
            case 'BY_AMOUNT': shares = Math.round(absValue * Math.pow(10, currencyInfo.decimal_digits)); break
            case 'BY_PERCENTAGE': shares = Math.round(absValue * 100); break
            case 'BY_SHARES': shares = Math.round(absValue); break
          }
          paidForEntries.push({ participantId: participant.id, shares: Math.max(1, shares) })
        }

        if (!paidById && paidForEntries.length > 0) {
          paidById = paidForEntries[0].participantId
        }
      } else {
        if (group.participants.length === 0) {
          anomalies.push(createAnomaly(rowNum, 'paidFor', 'NO_PARTICIPANTS', 'error', 'skipped', 'No participants in group'))
          continue
        }
        paidById = group.participants[0].id
        for (let pi = 0; pi < group.participants.length; pi++) {
          paidForEntries.push({ participantId: group.participants[pi].id, shares: 1 })
        }
      }

      if (!paidById) {
        anomalies.push(createAnomaly(rowNum, 'paidBy', 'PAID_BY_UNKNOWN', 'error', 'skipped', 'Could not determine who paid'))
        continue
      }
      if (paidForEntries.length === 0) {
        anomalies.push(createAnomaly(rowNum, 'paidFor', 'NO_SPLIT', 'error', 'skipped', 'Could not determine who the expense is for'))
        continue
      }

      // Optional fields
      let originalAmount: number | undefined
      let originalCurrency: string | undefined
      let conversionRate: number | undefined

      if (row.originalCost || row.originalAmount) {
        const oa = parseFloat((row.originalCost || row.originalAmount) as string)
        if (!isNaN(oa) && oa > 0) originalAmount = Math.round(oa * 100)
      }
      if (row.originalCurrency) originalCurrency = (row.originalCurrency as string).trim()
      if (row.conversionRate) {
        const cr = parseFloat(row.conversionRate as string)
        if (!isNaN(cr) && cr > 0) conversionRate = cr
      }

      const notesRawExport = (row.notes || '').trim() || undefined

      await createExpenseWithActivity(
        group.id,
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
        paidForEntries,
        notesRawExport,
      )
      imported++
    } catch (err) {
      anomalies.push(
        createAnomaly(
          rowNum,
          'general',
          'UNEXPECTED_ERROR',
          'error',
          'skipped',
          err instanceof Error ? err.message : 'Unknown error',
        ),
      )
    }
  }

  return buildResult(imported, anomalies, parsed.data.length)
}

// ─── Assignment CSV Parser (new, for the assignment CSV format) ──────────

async function parseAssignmentCsv(
  rawCsv: string,
  group: {
    id: string
    currencyCode: string | null
    participants: Array<{ id: string; name: string; joinedAt: Date; leftAt: Date | null }>
  },
  categories: Array<{ id: number; name: string; grouping: string }>,
  preferredDateFormat?: 'dd/mm' | 'mm/dd',
): Promise<ImportResult> {
  const anomalies: Anomaly[] = []
  let imported = 0

  const parsed = Papa.parse<Record<string, string>>(rawCsv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  })

  if (parsed.data.length === 0) {
    return { success: 0, anomalies: [], summary: { totalRows: 0, imported: 0, skipped: 0, autoFixed: 0, warnings: 0, errors: 0 } }
  }

  // Collect all date strings for inconsistency detection
  const allDateStrings: string[] = []
  for (let ri = 0; ri < parsed.data.length; ri++) {
    const dateVal = parsed.data[ri]['date'] || parsed.data[ri]['Date'] || ''
    if (dateVal) allDateStrings.push(dateVal)
  }

  const hasInconsistentDates = detectDateFormatInconsistency(allDateStrings)

  const categoryMap = new Map<string, number>()
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci]
    categoryMap.set(cat.name.toLowerCase(), cat.id)
    categoryMap.set(`${cat.grouping.toLowerCase()}/${cat.name.toLowerCase()}`, cat.id)
  }

  // Track seen entries for duplicate detection
  const seenEntries = new Map<string, number[]>() // key -> row numbers
  const keyForRow = (title: string, amount: number, date: string) =>
    `${title.toLowerCase().replace(/[^a-z0-9]/g, '')}_${amount}_${date}`

  for (let rowIndex = 0; rowIndex < parsed.data.length; rowIndex++) {
    const row = parsed.data[rowIndex]
    const rowNum = rowIndex + 2

    try {
      // ── Step 1: Parse Date ──────────────────────────────────────────
      const dateRaw = (row.date || row.Date || '').trim()
      if (!dateRaw) {
        anomalies.push(createAnomaly(rowNum, 'date', 'DATE_MISSING', 'error', 'skipped', 'Missing date'))
        continue
      }

      const dateResult = parseDate(dateRaw, preferredDateFormat)
      if (dateResult === null) {
        anomalies.push(createAnomaly(rowNum, 'date', 'DATE_UNPARSEABLE', 'error', 'skipped', `Cannot parse date "${dateRaw}"`))
        continue
      }
      if (dateResult === 'ambiguous') {
        anomalies.push(createAnomaly(rowNum, 'date', 'DATE_AMBIGUOUS', 'error', 'flagged', `Ambiguous date format "${dateRaw}" — need date format preference`))
        continue
      }
      const expenseDate = dateResult

      // Date format inconsistency warning
      if (hasInconsistentDates && rowIndex === 0) {
        anomalies.push(createAnomaly(0, 'date', 'DATE_FORMAT_INCONSISTENT', 'warning', 'flagged', 'CSV uses multiple date formats (ISO, DD/MM/YYYY, text month)'))
      }

      // ── Step 2: Parse Title ─────────────────────────────────────────
      const title = (row.description || row.Description || '').trim()
      if (!title || title.length < 2) {
        anomalies.push(createAnomaly(rowNum, 'description', 'TITLE_MISSING', 'error', 'skipped', 'Missing or too short description'))
        continue
      }

      // ── Step 3: Parse Amount ────────────────────────────────────────
      const amountRaw = (row.amount || row.Amount || '').trim()
      if (!amountRaw) {
        anomalies.push(createAnomaly(rowNum, 'amount', 'AMOUNT_MISSING', 'error', 'skipped', 'Missing amount'))
        continue
      }

      const amountParsed = parseAmount(amountRaw)
      if (!amountParsed) {
        anomalies.push(createAnomaly(rowNum, 'amount', 'AMOUNT_INVALID', 'error', 'skipped', `Invalid amount "${amountRaw}"`))
        continue
      }

      let amountValue = amountParsed.value

      // Check for excessive precision
      if (hasExcessivePrecision(amountValue)) {
        // Round to 2 decimal places
        const rounded = Math.round(amountValue * 100) / 100
        anomalies.push(createAnomaly(rowNum, 'amount', 'AMOUNT_EXTRA_PRECISION', 'info', 'auto-fixed', `Excessive decimal precision in amount "${amountRaw}"`, `Rounded to ${rounded}`, amountRaw))
        amountValue = rounded
      }

      // Check for commas
      if (amountParsed.hadCommas) {
        anomalies.push(createAnomaly(rowNum, 'amount', 'AMOUNT_COMMAS', 'info', 'auto-fixed', `Thousands separator in amount "${amountRaw}"`, `Stripped commas → ${amountValue}`, amountRaw))
      }

      // Check for negative (refund) or zero
      const isNegative = amountValue < 0
      const isZero = amountValue === 0
      if (isNegative) {
        const absVal = Math.abs(amountValue)
        anomalies.push(createAnomaly(rowNum, 'amount', 'AMOUNT_NEGATIVE', 'warning', 'auto-fixed', `Negative amount "${amountRaw}" (refund)`, `Converted to positive ${absVal} (will be marked as payment back)`, amountRaw))
        amountValue = absVal
      }
      if (isZero) {
        anomalies.push(createAnomaly(rowNum, 'amount', 'AMOUNT_ZERO', 'error', 'skipped', `Zero amount "${amountRaw}"`))
        continue
      }

      // ── Step 4: Parse Currency ──────────────────────────────────────
      const currencyRaw = (row.currency || row.Currency || '').trim()
      if (!currencyRaw) {
        anomalies.push(createAnomaly(rowNum, 'currency', 'CURRENCY_MISSING', 'info', 'auto-fixed', 'Missing currency', `Defaulted to group currency`))
      }

      // Determine if we need to set originalCurrency
      let originalAmountVal: number | undefined
      let originalCurrencyVal: string | undefined
      let conversionRateVal: number | undefined

      // Note: if currency differs from group currency, we note the original
      // currency code but cannot store originalAmount without a conversion rate.
      // Setting originalAmount to the same numeric value would be misleading.
      if (currencyRaw && group.currencyCode && currencyRaw.toUpperCase() !== group.currencyCode.toUpperCase()) {
        originalCurrencyVal = currencyRaw.toUpperCase()
      }

      // ── Step 5: Parse paid_by ──────────────────────────────────────
      const paidByRaw = (row.paid_by || row['Paid By'] || row['Paid_by'] || '').trim()
      if (!paidByRaw) {
        anomalies.push(createAnomaly(rowNum, 'paid_by', 'PAID_BY_MISSING', 'error', 'skipped', 'No payer specified'))
        continue
      }

      const payerMatch = findParticipant(paidByRaw, group.participants)
      if (!payerMatch) {
        anomalies.push(createAnomaly(rowNum, 'paid_by', 'PAID_BY_UNKNOWN', 'error', 'skipped', `Payer "${paidByRaw}" not found in group participants`))
        continue
      }
      if (!payerMatch.exact) {
        anomalies.push(createAnomaly(rowNum, 'paid_by', 'PARTICIPANT_NAME_CASE', 'info', 'auto-fixed', `Participant name case mismatch: "${paidByRaw}" matched to "${payerMatch.name}"`, undefined, paidByRaw))
        // Check for similar-but-different name
        const similarPayer = payerMatch.name.toLowerCase() !== paidByRaw.trim().toLowerCase()
        if (similarPayer) {
          anomalies.push(createAnomaly(rowNum, 'paid_by', 'PARTICIPANT_NAME_SIMILAR', 'warning', 'flagged', `Name "${paidByRaw}" is similar to participant "${payerMatch.name}" — confirm correct match`))
        }
      }
      const paidById = payerMatch.id

      // Check if payer was active on the expense date
      const payerParticipant = group.participants.find((p) => p.id === paidById)
      if (payerParticipant && isParticipantInactiveOnDate(payerParticipant, expenseDate)) {
        anomalies.push(createAnomaly(rowNum, 'paid_by', 'MEMBER_NOT_ACTIVE', 'error', 'skipped', `Payer "${payerMatch.name}" was not an active member on ${expenseDate.toISOString().split('T')[0]} (joined: ${payerParticipant.joinedAt.toISOString().split('T')[0]}${payerParticipant.leftAt ? `, left: ${payerParticipant.leftAt.toISOString().split('T')[0]}` : ''})`))
        continue
      }

      // ── Step 6: Check notes for settlement signals ──────────────────
      const notesRaw = (row.notes || row.Notes || '').trim()
      const isSettlementFromNotes =
        /settlement|paid back|reimbursement|pay\s+(back|off)/i.test(notesRaw)
      if (isSettlementFromNotes && notesRaw) {
        anomalies.push(createAnomaly(rowNum, 'notes', 'SETTLEMENT_IN_NOTES', 'warning', 'auto-fixed', `Notes indicate settlement: "${notesRaw}"`, 'Will be imported as reimbursement', notesRaw))
      }

      // ── Step 7: Parse split_type ───────────────────────────────────
      const splitTypeRaw = (row.split_type || row['Split Type'] || row['Split_Type'] || '').trim()
      const splitModeResult = mapSplitMode(splitTypeRaw)
      let splitMode = splitModeResult.mode

      if (!splitTypeRaw) {
        anomalies.push(createAnomaly(rowNum, 'split_type', 'SPLIT_TYPE_MISSING', 'warning', 'auto-fixed', 'Missing split type', `Defaulted to EVENLY`))
      } else if (!splitModeResult.matched) {
        anomalies.push(createAnomaly(rowNum, 'split_type', 'SPLIT_TYPE_UNKNOWN', 'warning', 'auto-fixed', `Unknown split type "${splitTypeRaw}"`, `Defaulted to EVENLY`, splitTypeRaw))
      }

      // ── Step 8: Parse split_with ────────────────────────────────────
      const splitWithRaw = (row.split_with || row['Split With'] || row['Split_With'] || '')
      const splitWithNames = parseSplitWith(splitWithRaw)
      const splitParticipants: Array<{ id: string; name: string }> = []

      for (const name of splitWithNames) {
        const match = findParticipant(name, group.participants)
        if (!match) {
          anomalies.push(createAnomaly(rowNum, 'split_with', 'PARTICIPANT_UNKNOWN', 'warning', 'skipped', `Participant "${name}" in split_with not found in group — excluded from split`))
          continue
        }
        if (!match.exact) {
          anomalies.push(createAnomaly(rowNum, 'split_with', 'PARTICIPANT_NAME_CASE', 'info', 'auto-fixed', `Name "${name}" matched to "${match.name}"`))
          // Check for similar-but-different name
          const similarName = match.name.toLowerCase() !== name.trim().toLowerCase()
          if (similarName) {
            anomalies.push(createAnomaly(rowNum, 'split_with', 'PARTICIPANT_NAME_SIMILAR', 'warning', 'flagged', `Name "${name}" is similar to participant "${match.name}" — confirm correct match`))
          }
        }

        // Check if participant was active on the expense date
        const splitParticipantFull = group.participants.find((p) => p.id === match.id)
        if (splitParticipantFull && isParticipantInactiveOnDate(splitParticipantFull, expenseDate)) {
          anomalies.push(createAnomaly(rowNum, 'split_with', 'MEMBER_NOT_ACTIVE', 'error', 'skipped', `Participant "${match.name}" was not an active member on ${expenseDate.toISOString().split('T')[0]} (joined: ${splitParticipantFull.joinedAt.toISOString().split('T')[0]}${splitParticipantFull.leftAt ? `, left: ${splitParticipantFull.leftAt.toISOString().split('T')[0]}` : ''})`))
          continue
        }

        splitParticipants.push({ id: match.id, name: match.name })
      }

      if (splitParticipants.length === 0) {
        anomalies.push(createAnomaly(rowNum, 'split_with', 'NO_VALID_SPLIT_PARTICIPANTS', 'error', 'skipped', 'No valid participants found in split_with'))
        continue
      }

      // ── Step 9: Parse split_details ─────────────────────────────────
      const splitDetailsRaw = (row.split_details || row['Split Details'] || row['Split_Details'] || '').trim()
      const parsedDetails = splitDetailsRaw
        ? parseSplitDetails(splitDetailsRaw, splitTypeRaw || 'equal')
        : null

      // Build paidFor entries
      const paidForEntries: Array<{ participantId: string; shares: number }> = []

      if (parsedDetails && parsedDetails.length > 0) {
        // Use parsed details
        for (const detail of parsedDetails) {
          const match = findParticipant(detail.participantName, group.participants)
          if (!match) {
            anomalies.push(createAnomaly(rowNum, 'split_details', 'PARTICIPANT_UNKNOWN', 'warning', 'skipped', `Participant "${detail.participantName}" in split_details not found — excluded`))
            continue
          }
          if (!match.exact) {
            anomalies.push(createAnomaly(rowNum, 'split_details', 'PARTICIPANT_NAME_CASE', 'info', 'auto-fixed', `Name "${detail.participantName}" matched to "${match.name}"`))
            // Check for similar-but-different name
            const similarName = match.name.toLowerCase() !== detail.participantName.trim().toLowerCase()
            if (similarName) {
              anomalies.push(createAnomaly(rowNum, 'split_details', 'PARTICIPANT_NAME_SIMILAR', 'warning', 'flagged', `Name "${detail.participantName}" is similar to participant "${match.name}" — confirm correct match`))
            }
          }

          // Check if participant was active on the expense date
          const detailParticipantFull = group.participants.find((p) => p.id === match.id)
          if (detailParticipantFull && isParticipantInactiveOnDate(detailParticipantFull, expenseDate)) {
            anomalies.push(createAnomaly(rowNum, 'split_details', 'MEMBER_NOT_ACTIVE', 'error', 'skipped', `Participant "${match.name}" was not an active member on ${expenseDate.toISOString().split('T')[0]} (joined: ${detailParticipantFull.joinedAt.toISOString().split('T')[0]}${detailParticipantFull.leftAt ? `, left: ${detailParticipantFull.leftAt.toISOString().split('T')[0]}` : ''})`))
            continue
          }

          let shares = 1
          switch (splitMode) {
            case 'EVENLY':
              shares = 1
              break
            case 'BY_AMOUNT':
              // detail.value is the amount for this person
              // Check if it has extra precision
              if (hasExcessivePrecision(detail.value)) {
                const rounded = Math.round(detail.value * 100) / 100
                anomalies.push(createAnomaly(rowNum, 'split_details', 'AMOUNT_EXTRA_PRECISION', 'info', 'auto-fixed', `Excessive precision in split share for ${detail.participantName}: ${detail.value} → ${rounded}`))
                shares = Math.round(rounded * (group.currencyCode ? Math.pow(10, getCurrency(group.currencyCode).decimal_digits) : 100))
              } else {
                shares = Math.round(detail.value * (group.currencyCode ? Math.pow(10, getCurrency(group.currencyCode).decimal_digits) : 100))
              }
              break
            case 'BY_PERCENTAGE':
              // detail.value is a percentage (e.g., 30)
              shares = Math.round(detail.value * 100) // convert to basis points
              break
            case 'BY_SHARES':
              shares = Math.max(1, detail.value)
              break
          }
          paidForEntries.push({ participantId: match.id, shares: Math.max(1, shares) })
        }
      } else {
        // No details — equal split among split_with participants
        const equalShare = 1
        for (const sp of splitParticipants) {
          paidForEntries.push({ participantId: sp.id, shares: equalShare })
        }
      }

      // If no paidFor entries after all processing, skip
      if (paidForEntries.length === 0) {
        anomalies.push(createAnomaly(rowNum, 'split_with', 'NO_VALID_SPLIT_PARTICIPANTS', 'error', 'skipped', 'No valid split participants after processing'))
        continue
      }

      // ── Step 10: Convert amount to minor units ─────────────────────
      const minorAmount = Math.round(amountValue * 100)

      // ── Step 11: Duplicate Detection ───────────────────────────────
      const dateStr = expenseDate.toISOString().split('T')[0]
      const key = keyForRow(title, minorAmount, dateStr)
      const existingRows = seenEntries.get(key)
      if (existingRows) {
        anomalies.push(
          createAnomaly(
            rowNum,
            'description',
            'DUPLICATE_EXPENSE',
            'warning',
            'flagged',
            `Possible duplicate of row ${existingRows[0]}: "${title}" (${amountValue}) on ${dateStr}`,
          ),
        )
        // Still import it — flagging but not blocking
      }
      const rows = seenEntries.get(key) || []
      rows.push(rowNum)
      seenEntries.set(key, rows)

      // Capture notes (includes settlement context)
      const notesVal = notesRaw || undefined

      // ── Step 12: Create the expense ────────────────────────────────
      await createExpenseWithActivity(
        group.id,
        expenseDate,
        title,
        0, // Default category
        minorAmount,
        undefined, // Don't set originalAmount without a conversion rate
        originalCurrencyVal,
        conversionRateVal,
        paidById,
        splitMode,
        isSettlementFromNotes,
        paidForEntries,
        notesVal,
      )
      imported++
    } catch (err) {
      anomalies.push(
        createAnomaly(
          rowNum,
          'general',
          'UNEXPECTED_ERROR',
          'error',
          'skipped',
          err instanceof Error ? err.message : 'Unknown error',
        ),
      )
    }
  }

  return buildResult(imported, anomalies, parsed.data.length)
}

// ─── Shared Helpers ────────────────────────────────────────────────────────

async function createExpenseWithActivity(
  groupId: string,
  expenseDate: Date,
  title: string,
  categoryId: number,
  amount: number,
  originalAmount: number | undefined,
  originalCurrency: string | undefined,
  conversionRate: number | undefined,
  paidById: string,
  splitMode: 'EVENLY' | 'BY_SHARES' | 'BY_PERCENTAGE' | 'BY_AMOUNT',
  isReimbursement: boolean,
  paidForEntries: Array<{ participantId: string; shares: number }>,
  notes?: string,
) {
  const expenseId = randomId()
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
      notes,
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

  await logActivity(groupId, ActivityType.CREATE_EXPENSE, {
    expenseId,
    data: title,
  })
}

function buildResult(
  imported: number,
  anomalies: Anomaly[],
  totalRows: number,
): ImportResult {
  const errors = anomalies.filter((a) => a.severity === 'error')
  const warnings = anomalies.filter((a) => a.severity === 'warning')
  const autoFixed = anomalies.filter((a) => a.action === 'auto-fixed')

  return {
    success: imported,
    anomalies,
    summary: {
      totalRows,
      imported,
      skipped: totalRows - imported,
      autoFixed: autoFixed.length,
      warnings: warnings.length,
      errors: errors.length,
    },
  }
}

// ─── Main Procedure ──────────────────────────────────────────────────────

export const importCsvExpensesProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      hash: z.string().length(8),
      csvContent: z.string().min(1),
      preferredDateFormat: z.enum(['dd/mm', 'mm/dd']).optional(),
    }),
  )
  .mutation(
    async ({
      input: { groupId, hash, csvContent, preferredDateFormat },
    }) => {
      const isAuthenticated = await verifyUserAuthenticated(hash)
      if (!isAuthenticated) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })
      }

      // Get group with participants
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: { participants: true },
      })
      if (!group) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Group not found',
        })
      }

      // Reset anomaly counter
      resetAnomalyCounter()

      // Detect CSV format
      const rawHeaders = Papa.parse(csvContent, { header: false, preview: 1 })
        .data[0] as string[]
      const format = detectCsvFormat(rawHeaders)

      // Get categories
      const categories = await prisma.category.findMany()

      let result: ImportResult

      if (format === 'app-export') {
        result = await parseAppExportCsv(csvContent, group, categories)
      } else {
        // Check for ambiguous dates before processing
        if (!preferredDateFormat) {
          const rawData = Papa.parse<Record<string, string>>(csvContent, {
            header: true,
            skipEmptyLines: true,
          })
          const dateStrings: string[] = []
          for (let ri = 0; ri < rawData.data.length; ri++) {
            const dv = rawData.data[ri]['date'] || rawData.data[ri]['Date'] || ''
            if (dv) dateStrings.push(dv)
          }
          const ambiguous = findAmbiguousDates(dateStrings)
          if (ambiguous.length > 0) {
            return {
              success: 0,
              anomalies: [],
              summary: { totalRows: 0, imported: 0, skipped: 0, autoFixed: 0, warnings: 0, errors: 0 },
              ambiguousDates: ambiguous,
              requiresDateFormat: true,
            } as ImportResult & { ambiguousDates: AmbiguousDateInfo[]; requiresDateFormat: true }
          }
        }

        result = await parseAssignmentCsv(
          csvContent,
          group as {
            id: string
            currencyCode: string | null
            participants: Array<{ id: string; name: string; joinedAt: Date; leftAt: Date | null }>
          },
          categories,
          preferredDateFormat,
        )
      }

      return result
    },
  )
