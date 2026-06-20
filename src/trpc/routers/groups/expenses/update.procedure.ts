import { updateExpense } from '@/lib/api'
import { verifyUserAuthenticated, verifyGroupOwnership, verifyParticipantOwnership, verifyGroupMembership } from '@/lib/auth'
import { expenseFormSchema } from '@/lib/schemas'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const updateGroupExpenseProcedure = baseProcedure
  .input(
    z.object({
      expenseId: z.string().min(1),
      groupId: z.string().min(1),
      hash: z.string().length(8),
      expenseFormValues: expenseFormSchema,
      participantId: z.string().optional(),
    }),
  )
  .mutation(
    async ({
      input: { expenseId, groupId, hash, expenseFormValues, participantId },
    }) => {
      const isAuthenticated = await verifyUserAuthenticated(hash)
      if (!isAuthenticated) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
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
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not authorized to update expenses in this group' })
      }

      const expense = await updateExpense(
        groupId,
        expenseId,
        expenseFormValues,
        participantId,
      )
      return { expenseId: expense.id }
    },
  )
