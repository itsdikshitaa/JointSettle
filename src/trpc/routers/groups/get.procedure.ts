import { verifyUserAuthenticated } from '@/lib/auth'
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
    if (!hash) {
      return { group: null, isOwner: false }
    }
    const isAuthenticated = await verifyUserAuthenticated(hash)
    if (!isAuthenticated) {
      return { group: null, isOwner: false }
    }
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { participants: true },
    })

    // Determine if the current user is the group owner
    const user = await prisma.user.findUnique({ where: { hash } })
    const isOwner = user !== null && group !== null && group.userId === user.id

    return { group, isOwner }
  })
