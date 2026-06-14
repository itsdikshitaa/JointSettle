import { getGroups } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const listGroupsProcedure = baseProcedure
  .input(
    z.object({
      groupIds: z.array(z.string().min(1)),
      hash: z.string().length(8),
    }),
  )
  .query(async ({ input: { groupIds, hash } }) => {
    // Verify the user exists and only return groups they own
    const user = await prisma.user.findUnique({ where: { hash } })
    if (!user) {
      return { groups: [] }
    }
    const groups = await getGroups(groupIds)
    // Filter to only groups owned by this user
    const userGroups = groups.filter((g) => g.userId === user.id)
    return { groups: userGroups }
  })
