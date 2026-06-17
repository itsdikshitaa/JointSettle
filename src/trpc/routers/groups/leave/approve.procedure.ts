import { verifyGroupOwnership } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const approveLeaveProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      hash: z.string().length(8),
      requestId: z.string().min(1),
    }),
  )
  .mutation(async ({ input: { groupId, hash, requestId } }) => {
    // Only the group owner can approve leave requests
    const isOwner = await verifyGroupOwnership(hash, groupId)
    if (!isOwner) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Only the group owner can approve leave requests.',
      })
    }

    // Find the leave request
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
    })
    if (!leaveRequest || leaveRequest.groupId !== groupId) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave request not found.' })
    }
    if (leaveRequest.status !== 'pending') {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'This leave request has already been resolved.',
      })
    }

    // Approve: set leftAt on participant and mark request as approved
    await prisma.$transaction([
      prisma.participant.update({
        where: { id: leaveRequest.participantId },
        data: { leftAt: new Date() },
      }),
      prisma.leaveRequest.update({
        where: { id: requestId },
        data: { status: 'approved', resolvedAt: new Date() },
      }),
    ])

    return { success: true }
  })
