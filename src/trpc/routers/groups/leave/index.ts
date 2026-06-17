import { createTRPCRouter } from '@/trpc/init'
import { requestLeaveProcedure } from './request.procedure'
import { approveLeaveProcedure } from './approve.procedure'
import { rejectLeaveProcedure } from './reject.procedure'
import { listLeaveRequestsProcedure } from './listRequests.procedure'

export const groupLeaveRouter = createTRPCRouter({
  request: requestLeaveProcedure,
  approve: approveLeaveProcedure,
  reject: rejectLeaveProcedure,
  listRequests: listLeaveRequestsProcedure,
})
