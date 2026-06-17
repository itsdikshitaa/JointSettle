import { verifyGroupOwnership } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const listLeaveRequestsProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      hash: z.string().length(8),
    }),
  )
  .query(async ({ input: { groupId, hash } }) => {
    // Only the group owner can view leave requests
    const isOwner = await verifyGroupOwnership(hash, groupId)
    if (!isOwner) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Only the group owner can view leave requests.',
      })
    }

    const requests = await prisma.leaveRequest.findMany({
      where: { groupId },
      include: {
        participant: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    })

    return { requests }
  })
