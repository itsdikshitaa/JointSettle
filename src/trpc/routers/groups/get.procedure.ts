import { verifyUserAuthenticated, verifyGroupOwnership, verifyGroupMembership } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getGroupProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      hash: z.string().length(8).optional(),
      participantId: z.string().optional(),
    }),
  )
  .query(async ({ input: { groupId, hash, participantId } }) => {
    if (!hash) {
      return { group: null, isOwner: false }
    }
    const isAuthenticated = await verifyUserAuthenticated(hash)
    if (!isAuthenticated) {
      return { group: null, isOwner: false }
    }

    // Caller must be either the group owner or a participant
    const isOwner = await verifyGroupOwnership(hash, groupId)
    const isParticipant = await verifyGroupMembership(groupId, participantId)
    if (!isOwner && !isParticipant) {
      return { group: null, isOwner: false }
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { participants: { where: { leftAt: null } } },
    })

    return { group, isOwner }
  })
