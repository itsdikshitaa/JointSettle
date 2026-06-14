'use client'
import { Button } from '@/components/ui/button'
import { DateTimeStyle, cn, formatDate } from '@/lib/utils'
import { AppRouterOutput } from '@/trpc/routers/_app'
import { ActivityType, Participant } from '@prisma/client'
import { ChevronRight, Plus, Pencil, Trash2, Settings } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export type Activity =
  AppRouterOutput['groups']['activities']['list']['activities'][number]

type Props = {
  groupId: string
  activity: Activity
  participant?: Participant
  dateStyle: DateTimeStyle
}

function ActivityIcon({ type }: { type: ActivityType }) {
  const iconClasses = 'w-3.5 h-3.5'
  switch (type) {
    case ActivityType.CREATE_EXPENSE:
      return <Plus className={cn(iconClasses, 'text-emerald-600 dark:text-emerald-400')} />
    case ActivityType.UPDATE_EXPENSE:
      return <Pencil className={cn(iconClasses, 'text-blue-600 dark:text-blue-400')} />
    case ActivityType.DELETE_EXPENSE:
      return <Trash2 className={cn(iconClasses, 'text-red-600 dark:text-red-400')} />
    case ActivityType.UPDATE_GROUP:
      return <Settings className={cn(iconClasses, 'text-amber-600 dark:text-amber-400')} />
    default:
      return null
  }
}

function useSummary(activity: Activity, participantName?: string) {
  const t = useTranslations('Activity')
  const participant = participantName ?? t('someone')
  const expense = activity.data ?? ''

  const tr = (key: string) =>
    t.rich(key, {
      expense,
      participant,
      em: (chunks) => <em>&ldquo;{chunks}&rdquo;</em>,
      strong: (chunks) => <strong>{chunks}</strong>,
    })

  if (activity.activityType == ActivityType.UPDATE_GROUP) {
    return <>{tr('settingsModified')}</>
  } else if (activity.activityType == ActivityType.CREATE_EXPENSE) {
    return <>{tr('expenseCreated')}</>
  } else if (activity.activityType == ActivityType.UPDATE_EXPENSE) {
    return <>{tr('expenseUpdated')}</>
  } else if (activity.activityType == ActivityType.DELETE_EXPENSE) {
    return <>{tr('expenseDeleted')}</>
  }
}

export function ActivityItem({
  groupId,
  activity,
  participant,
  dateStyle,
}: Props) {
  const router = useRouter()
  const locale = useLocale()

  const expenseExists = activity.expense !== undefined
  const summary = useSummary(activity, participant?.name)

  return (
    <div className="relative pl-8 pb-3 group">
      {/* Timeline line */}
      <div className="absolute left-3 top-3 bottom-0 w-px bg-gradient-to-b from-blue-200/50 via-blue-200/30 to-transparent dark:from-blue-800/30 dark:via-blue-800/20 dark:to-transparent" />

      {/* Timeline dot */}
      <div className="absolute left-1 top-1.5 w-4 h-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-background flex items-center justify-center z-10">
        <ActivityIcon type={activity.activityType} />
      </div>

      {/* Activity card */}
      <div
        className={cn(
          'rounded-lg border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm px-3 py-2.5 text-sm transition-all duration-200 ease-out hover:shadow-sm hover:border-blue-200/40 dark:hover:border-blue-700/30',
          expenseExists && 'cursor-pointer hover:-translate-y-0.5',
        )}
        onClick={() => {
          if (expenseExists) {
            router.push(`/groups/${groupId}/expenses/${activity.expenseId}/edit`)
          }
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-1">
              {dateStyle !== undefined && (
                <span>{formatDate(activity.time, locale, { dateStyle })} · </span>
              )}
              <span>{formatDate(activity.time, locale, { timeStyle: 'short' })}</span>
            </div>
            <div className="text-sm leading-relaxed">{summary}</div>
          </div>
          {expenseExists && (
            <Button
              size="icon"
              variant="ghost"
              className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              asChild
            >
              <Link href={`/groups/${groupId}/expenses/${activity.expenseId}/edit`}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
