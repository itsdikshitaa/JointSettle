import { verifyUserAuthenticated } from '@/lib/auth'
import { randomId } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const requestLeaveProcedure = baseProcedure
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
    })
    if (!participant) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Participant not found' })
    }

    // Check if participant already has a pending leave request
    const existingPending = await prisma.leaveRequest.findFirst({
      where: {
        participantId,
        groupId,
        status: 'pending',
      },
    })
    if (existingPending) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'You already have a pending leave request.',
      })
    }

    // Check if participant has any expenses
    const expenseCounts = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        _count: {
          select: {
            expensesPaidBy: true,
            expensesPaidFor: true,
          },
        },
      },
    })
    if (
      expenseCounts &&
      (expenseCounts._count.expensesPaidBy > 0 || expenseCounts._count.expensesPaidFor > 0)
    ) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Cannot leave group. You have expenses in this group.',
      })
    }

    // Create the leave request
    await prisma.leaveRequest.create({
      data: {
        id: randomId(),
        groupId,
        participantId,
        status: 'pending',
      },
    })

    return { success: true }
  })
