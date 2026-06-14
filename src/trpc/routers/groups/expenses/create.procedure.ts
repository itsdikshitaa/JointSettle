import { createExpense } from '@/lib/api'
import { verifyGroupOwnership } from '@/lib/auth'
import { expenseFormSchema } from '@/lib/schemas'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const createGroupExpenseProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      hash: z.string().length(8),
      expenseFormValues: expenseFormSchema,
      participantId: z.string().optional(),
    }),
  )
  .mutation(
    async ({ input: { groupId, hash, expenseFormValues, participantId } }) => {
      const isOwner = await verifyGroupOwnership(hash, groupId)
      if (!isOwner) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You do not own this group' })
      }
      const expense = await createExpense(
        expenseFormValues,
        groupId,
        participantId,
      )
      return { expenseId: expense.id }
    },
  )
