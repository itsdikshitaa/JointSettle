import { updateGroup } from '@/lib/api'
import { verifyGroupOwnership } from '@/lib/auth'
import { groupFormSchema } from '@/lib/schemas'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const updateGroupProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      hash: z.string().length(8),
      groupFormValues: groupFormSchema,
      participantId: z.string().optional(),
    }),
  )
  .mutation(async ({ input: { groupId, hash, groupFormValues, participantId } }) => {
    const isOwner = await verifyGroupOwnership(hash, groupId)
    if (!isOwner) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You do not own this group' })
    }
    await updateGroup(groupId, groupFormValues, participantId)
  })
