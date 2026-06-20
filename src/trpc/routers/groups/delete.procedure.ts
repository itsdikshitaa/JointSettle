import { verifyGroupOwnership } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const deleteGroupProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      hash: z.string().length(8),
    }),
  )
  .mutation(async ({ input: { groupId, hash } }) => {
    const isOwner = await verifyGroupOwnership(hash, groupId)
    if (!isOwner) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Only the group owner can delete this group',
      })
    }

    // Delete the group — cascading deletes handle all related records
    // (participants, expenses, activities, import logs, etc.)
    await prisma.group.delete({
      where: { id: groupId },
    })

    return { success: true }
  })
