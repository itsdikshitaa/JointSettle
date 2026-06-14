import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getGroupProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      hash: z.string().length(8).optional(),
    }),
  )
  .query(async ({ input: { groupId, hash } }) => {
    // If a hash is provided, verify the user owns this group
    if (hash) {
      const user = await prisma.user.findUnique({ where: { hash } })
      if (!user) {
        return { group: null }
      }
      const group = await prisma.group.findFirst({
        where: { id: groupId, userId: user.id },
        include: { participants: true },
      })
      return { group }
    }
    // No hash - deny access
    return { group: null }
  })
