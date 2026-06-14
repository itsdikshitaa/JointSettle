import { createGroup } from '@/lib/api'
import { groupFormSchema } from '@/lib/schemas'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const createGroupProcedure = baseProcedure
  .input(
    z.object({
      groupFormValues: groupFormSchema,
      hash: z.string().length(8),
    }),
  )
  .mutation(async ({ input: { groupFormValues, hash } }) => {
    const group = await createGroup(groupFormValues, hash)
    return { groupId: group.id }
  })
