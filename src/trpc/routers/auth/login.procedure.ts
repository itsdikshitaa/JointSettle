import { getUserByHash } from '@/lib/auth'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const loginProcedure = baseProcedure
  .input(
    z.object({
      hash: z.string().length(8),
    }),
  )
  .query(async ({ input: { hash } }) => {
    const user = await getUserByHash(hash)
    if (!user) {
      return { valid: false, hash: null }
    }
    return { valid: true, hash: user.hash }
  })
