import { GroupTabs } from '@/app/groups/[groupId]/group-tabs'
import { ShareButton } from '@/app/groups/[groupId]/share-button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { useCurrentGroup } from './current-group-context'

export const GroupHeader = () => {
  const { isLoading, groupId, group } = useCurrentGroup()

  return (
    <div className="sticky top-0 z-40 -mx-4 px-4 pt-4 pb-2 bg-gradient-to-b from-background/95 via-background/95 to-transparent backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center shrink-0 shadow-sm">
            <Users className="w-5 h-5 text-blue-700 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading font-bold text-xl sm:text-2xl tracking-tight truncate">
              {isLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                <Link href={`/groups/${groupId}`} className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-200">
                  {group.name}
                </Link>
              )}
            </h1>
          </div>
        </div>
        {group && <ShareButton group={group} />}
      </div>
      <GroupTabs groupId={groupId} />
    </div>
  )
}
