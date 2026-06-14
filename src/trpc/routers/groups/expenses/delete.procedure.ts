import { deleteExpense } from '@/lib/api'
import { verifyGroupOwnership } from '@/lib/auth'
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
    const isOwner = await verifyGroupOwnership(hash, groupId)
    if (!isOwner) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You do not own this group' })
    }
    await deleteExpense(groupId, expenseId, participantId)
    return {}
  })
