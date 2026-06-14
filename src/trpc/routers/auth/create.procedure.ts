import { createUser } from '@/lib/auth'
import { baseProcedure } from '@/trpc/init'

export const signupProcedure = baseProcedure.mutation(async () => {
  const user = await createUser()
  return { hash: user.hash, id: user.id }
})
