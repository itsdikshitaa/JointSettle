import { prisma } from '@/lib/prisma'
import { verifyUserAuthenticated } from '@/lib/auth'
import { baseProcedure } from '@/trpc/init'
import { createTRPCRouter } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const groupImportsRouter = createTRPCRouter({
  get: baseProcedure
    .input(
      z.object({
        groupId: z.string().min(1),
        hash: z.string().length(8),
        importId: z.string().min(1),
      }),
    )
    .query(async ({ input: { groupId, hash, importId } }) => {
      const isAuthenticated = await verifyUserAuthenticated(hash)
      if (!isAuthenticated) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
      }

      const log = await prisma.importLog.findUnique({
        where: { id: importId },
      })

      if (!log || log.groupId !== groupId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Import log not found' })
      }

      return { import: log }
    }),
})
