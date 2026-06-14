import { verifyUserAuthenticated } from '@/lib/auth'
import { randomId } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const joinGroupProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      hash: z.string().length(8),
      name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
    }),
  )
  .mutation(async ({ input: { groupId, hash, name } }) => {
    const isAuthenticated = await verifyUserAuthenticated(hash)
    if (!isAuthenticated) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    }

    // Check group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { participants: true },
    })
    if (!group) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found' })
    }

    // Check if a participant with the same name already exists
    const existingParticipant = group.participants.find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    )
    if (existingParticipant) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A participant with this name already exists in this group',
      })
    }

    // Add the user as a participant
    const participant = await prisma.participant.create({
      data: {
        id: randomId(),
        name,
        groupId,
        joinedAt: new Date(),
      },
    })

    return { participant }
  })
