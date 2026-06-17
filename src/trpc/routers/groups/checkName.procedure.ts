import { prisma } from '@/lib/prisma'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const checkNameProcedure = baseProcedure
  .input(
    z.object({
      hash: z.string().length(8),
      name: z.string().min(2).max(50),
      excludeGroupId: z.string().optional(),
    }),
  )
  .query(async ({ input: { hash, name, excludeGroupId } }) => {
    const user = await prisma.user.findUnique({ where: { hash } })
    if (!user) {
      return { available: true }
    }

    const existingGroup = await prisma.group.findFirst({
      where: {
        userId: user.id,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeGroupId ? { id: { not: excludeGroupId } } : {}),
      },
    })

    return { available: !existingGroup }
  })
