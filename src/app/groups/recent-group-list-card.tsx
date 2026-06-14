import {
  RecentGroup,
  archiveGroup,
  deleteRecentGroup,
  starGroup,
  unarchiveGroup,
  unstarGroup,
} from '@/app/groups/recent-groups-helpers'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { AppRouterOutput } from '@/trpc/routers/_app'
import { StarFilledIcon } from '@radix-ui/react-icons'
import { Calendar, MoreHorizontal, Star, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function RecentGroupListCard({
  group,
  groupDetail,
  isStarred,
  isArchived,
  refreshGroupsFromStorage,
}: {
  group: RecentGroup
  groupDetail?: AppRouterOutput['groups']['list']['groups'][number]
  isStarred: boolean
  isArchived: boolean
  refreshGroupsFromStorage: () => void
}) {
  const router = useRouter()
  const locale = useLocale()
  const toast = useToast()
  const t = useTranslations('Groups')

  return (
    <li key={group.id} className="animate-fade-in-up">
      <div
        className="group cursor-pointer rounded-xl border border-blue-100/30 dark:border-blue-900/20 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-600/10 hover:border-blue-300/40 dark:hover:border-blue-700/40"
        onClick={() => router.push(`/groups/${group.id}`)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <Link
                href={`/groups/${group.id}`}
                className="font-semibold text-foreground hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-200 block truncate"
              >
                {group.name}
              </Link>
              {groupDetail ? (
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {groupDetail._count.participants}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(groupDetail.createdAt).toLocaleDateString(locale, {
                      dateStyle: 'medium',
                    })}
                  </span>
                </div>
              ) : (
                <div className="flex gap-2 mt-1">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8"
              onClick={(event) => {
                event.stopPropagation()
                if (isStarred) {
                  unstarGroup(group.id)
                } else {
                  starGroup(group.id)
                  unarchiveGroup(group.id)
                }
                refreshGroupsFromStorage()
              }}
            >
              {isStarred ? (
                <StarFilledIcon className="w-4 h-4 text-orange-400" />
              ) : (
                <Star className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="w-8 h-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(event) => {
                    event.stopPropagation()
                    deleteRecentGroup(group)
                    refreshGroupsFromStorage()

                    toast.toast({
                      title: t('RecentRemovedToast.title'),
                      description: t('RecentRemovedToast.description'),
                    })
                  }}
                >
                  {t('removeRecent')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation()
                    if (isArchived) {
                      unarchiveGroup(group.id)
                    } else {
                      archiveGroup(group.id)
                      unstarGroup(group.id)
                    }
                    refreshGroupsFromStorage()
                  }}
                >
                  {t(isArchived ? 'unarchive' : 'archive')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </li>
  )
}
