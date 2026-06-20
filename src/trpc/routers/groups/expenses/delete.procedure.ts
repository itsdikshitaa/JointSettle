import { deleteExpense } from '@/lib/api'
import { verifyUserAuthenticated, verifyGroupOwnership, verifyParticipantOwnership, verifyGroupMembership } from '@/lib/auth'
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

    // Caller must be either the group owner or own the participant identity
    const isOwner = await verifyGroupOwnership(hash, groupId)
    const ownsParticipant = participantId
      ? await verifyParticipantOwnership(participantId, hash)
      : false
    // Backward compatibility: if participant has no hash, fall back to membership check
    const isMember = !isOwner && !ownsParticipant && participantId
      ? await verifyGroupMembership(groupId, participantId)
      : false
    if (!isOwner && !ownsParticipant && !isMember) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not authorized to delete expenses in this group' })
    }

    await deleteExpense(groupId, expenseId, participantId)
    return {}
  })
