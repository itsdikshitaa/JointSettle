import { createTRPCRouter } from '@/trpc/init'
import { loginProcedure } from './login.procedure'
import { signupProcedure } from './create.procedure'

export const authRouter = createTRPCRouter({
  login: loginProcedure,
  signup: signupProcedure,
})
