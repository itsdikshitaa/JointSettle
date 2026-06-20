'use client'

import { trpc } from '@/trpc/client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { PropsWithChildren } from 'react'
import { CurrentGroupProvider } from './current-group-context'
import { GroupHeader } from './group-header'
import { useAuth } from '@/components/auth-provider'

export function GroupLayoutClient({
  groupId,
  children,
}: PropsWithChildren<{ groupId: string }>) {
  const { hash, isLoggedIn, initialized } = useAuth()
  const { data, isLoading } = trpc.groups.get.useQuery(
    { groupId, hash: hash ?? undefined },
    { enabled: isLoggedIn },
  )
  const t = useTranslations('Groups.NotFound')

  // Not initialized yet
  if (!initialized) return null

  // Not logged in - show login prompt
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">Please log in to view this group.</p>
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Go to Login
        </Link>
      </div>
    )
  }

  // Loading
  if (isLoading || !data) {
    return (
      <CurrentGroupProvider isLoading groupId={groupId} group={undefined} isOwner={false}>
        <GroupHeader />
        {children}
      </CurrentGroupProvider>
    )
  }

  // Loaded but group not found (auth failed or doesn't exist)
  if (!data.group) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">{t('text')}</p>
        <Link href="/groups" className="text-blue-600 dark:text-blue-400 hover:underline">
          Back to My Groups
        </Link>
      </div>
    )
  }

  // Success - group data is available
  return (
    <CurrentGroupProvider isLoading={false} groupId={groupId} group={data.group} isOwner={data.isOwner}>
      <GroupHeader />
      {children}
    </CurrentGroupProvider>
  )
}
