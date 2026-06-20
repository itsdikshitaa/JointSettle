import { getGroupExpenses } from '@/lib/api'
import { verifyUserAuthenticated, verifyGroupOwnership, verifyGroupMembership } from '@/lib/auth'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const listGroupExpensesProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      hash: z.string().length(8),
      cursor: z.number().optional(),
      limit: z.number().optional(),
      filter: z.string().optional(),
      participantId: z.string().optional(),
    }),
  )
  .query(async ({ input: { groupId, hash, cursor = 0, limit = 10, filter, participantId } }) => {
    const isAuthenticated = await verifyUserAuthenticated(hash)
    if (!isAuthenticated) {
      return { expenses: [], hasMore: false, nextCursor: 0 }
    }

    // Caller must be either the group owner or a participant
    const isOwner = await verifyGroupOwnership(hash, groupId)
    const isParticipant = await verifyGroupMembership(groupId, participantId)
    if (!isOwner && !isParticipant) {
      return { expenses: [], hasMore: false, nextCursor: 0 }
    }

    const expenses = await getGroupExpenses(groupId, {
      offset: cursor,
      length: limit + 1,
      filter,
    })
    return {
      expenses: expenses.slice(0, limit).map((expense) => ({
        ...expense,
        createdAt: new Date(expense.createdAt),
        expenseDate: new Date(expense.expenseDate),
      })),
      hasMore: !!expenses[limit],
      nextCursor: cursor + limit,
    }
  })
