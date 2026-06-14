'use server'

import { prisma } from '@/lib/prisma'

export type Stats = {
  groupsCount: number
  expensesCount: number
}

/**
 * Returns stats scoped to the user identified by the given hash.
 * Only counts groups and expenses owned by this user.
 * Returns null if the hash is invalid.
 */
export async function getUserStatsAction(
  hash: string,
): Promise<Stats | null> {
  'use server'
  const user = await prisma.user.findUnique({ where: { hash } })
  if (!user) return null

  const groupsCount = await prisma.group.count({
    where: { userId: user.id },
  })
  const expensesCount = await prisma.expense.count({
    where: {
      group: { userId: user.id },
    },
  })
  return { groupsCount, expensesCount }
}
