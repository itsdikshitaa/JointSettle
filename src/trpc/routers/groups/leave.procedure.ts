import { verifyUserAuthenticated } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const leaveGroupProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      hash: z.string().length(8),
      participantId: z.string().min(1),
    }),
  )
  .mutation(async ({ input: { groupId, hash, participantId } }) => {
    const isAuthenticated = await verifyUserAuthenticated(hash)
    if (!isAuthenticated) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    }

    // Check participant exists in the group
    const participant = await prisma.participant.findFirst({
      where: { id: participantId, groupId },
      include: {
        _count: {
          select: {
            expensesPaidBy: true,
            expensesPaidFor: true,
          },
        },
      },
    })
    if (!participant) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Participant not found' })
    }

    // Check if participant has any expenses
    if (participant._count.expensesPaidBy > 0 || participant._count.expensesPaidFor > 0) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Cannot leave group. You have expenses in this group.',
      })
    }

    // Remove the participant
    await prisma.participant.delete({
      where: { id: participantId },
    })

    return { success: true }
  })
