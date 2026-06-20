import { deleteExpense } from '@/lib/api'
import { verifyUserAuthenticated, verifyGroupMembership } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const deleteGroupExpenseProcedure = baseProcedure
  .input(
    z.object({
      expenseId: z.string().min(1),
      groupId: z.string().min(1),
      hash: z.string().length(8),
      participantId: z.string().optional(),
    }),
  )
  .mutation(async ({ input: { expenseId, groupId, hash, participantId } }) => {
    const isAuthenticated = await verifyUserAuthenticated(hash)
    if (!isAuthenticated) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    }

    // Verify the expense belongs to this group
    const expense = await prisma.expense.findUnique({ where: { id: expenseId } })
    if (!expense || expense.groupId !== groupId) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Expense not found' })
    }

    // Verify the participant is a member of the group
    if (participantId) {
      const isMember = await verifyGroupMembership(groupId, participantId)
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this group' })
      }
    }

    await deleteExpense(groupId, expenseId, participantId)
    return {}
  })
