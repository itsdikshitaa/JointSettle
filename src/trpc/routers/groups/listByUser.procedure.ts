import { getUserGroups } from '@/lib/api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const listByUserProcedure = baseProcedure
  .input(
    z.object({
      hash: z.string().length(8),
    }),
  )
  .query(async ({ input: { hash } }) => {
    const groups = await getUserGroups(hash)
    return { groups }
  })
