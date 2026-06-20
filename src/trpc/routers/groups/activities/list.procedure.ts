import { getActivities } from '@/lib/api'
import { verifyUserAuthenticated, verifyGroupOwnership, verifyGroupMembership } from '@/lib/auth'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const listGroupActivitiesProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string(),
      hash: z.string().length(8),
      cursor: z.number().optional().default(0),
      limit: z.number().optional().default(5),
      participantId: z.string().optional(),
    }),
  )
  .query(async ({ input: { groupId, hash, cursor, limit, participantId } }) => {
    const isAuthenticated = await verifyUserAuthenticated(hash)
    if (!isAuthenticated) {
      return { activities: [], hasMore: false, nextCursor: 0 }
    }

    // Caller must be either the group owner or a participant
    const isOwner = await verifyGroupOwnership(hash, groupId)
    const isParticipant = await verifyGroupMembership(groupId, participantId)
    if (!isOwner && !isParticipant) {
      return { activities: [], hasMore: false, nextCursor: 0 }
    }

    const activities = await getActivities(groupId, {
      offset: cursor,
      length: limit + 1,
    })
    return {
      activities: activities.slice(0, limit),
      hasMore: !!activities[limit],
      nextCursor: cursor + limit,
    }
  })
