import { ActivityList } from '@/app/groups/[groupId]/activity/activity-list'
import { Metadata } from 'next'
import { useTranslations } from 'next-intl'

export const metadata: Metadata = {
  title: 'Activity',
}

export function ActivityPageClient() {
  const t = useTranslations('Activity')

  return (
    <>
      <div className="rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-5 dark:shadow-[0_0_20px_hsl(var(--primary)_/_0.06)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
            <span className="text-blue-700 dark:text-blue-400 font-bold text-lg">◉</span>
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">{t('title')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t('description')}</p>
          </div>
        </div>
        <div>
          <ActivityList />
        </div>
      </div>
    </>
  )
}
