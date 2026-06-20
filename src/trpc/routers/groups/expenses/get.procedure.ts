import { getExpense } from '@/lib/api'
import { verifyUserAuthenticated, verifyGroupOwnership, verifyGroupMembership } from '@/lib/auth'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const getGroupExpenseProcedure = baseProcedure
  .input(z.object({ groupId: z.string().min(1), expenseId: z.string().min(1), hash: z.string().length(8), participantId: z.string().optional() }))
  .query(async ({ input: { groupId, expenseId, hash, participantId } }) => {
    const isAuthenticated = await verifyUserAuthenticated(hash)
    if (!isAuthenticated) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Expense not found' })
    }

    // Caller must be either the group owner or a participant
    const isOwner = await verifyGroupOwnership(hash, groupId)
    const isParticipant = await verifyGroupMembership(groupId, participantId)
    if (!isOwner && !isParticipant) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Expense not found' })
    }

    const expense = await getExpense(groupId, expenseId)
    if (!expense) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Expense not found',
      })
    }
    return { expense }
  })
