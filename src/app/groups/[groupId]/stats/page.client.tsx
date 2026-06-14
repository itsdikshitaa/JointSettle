import { StatsCharts } from '@/app/groups/[groupId]/stats/stats-charts'
import { Totals } from '@/app/groups/[groupId]/stats/totals'
import { useTranslations } from 'next-intl'

export function TotalsPageClient() {
  const t = useTranslations('Stats')

  return (
    <div className="space-y-4">
      {/* Analytics Dashboard */}
      <StatsCharts />

      {/* Existing Totals - restyled */}
      <div className="rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-6">
        <h2 className="font-heading font-bold text-lg mb-4">{t('Totals.title')}</h2>
        <p className="text-xs text-muted-foreground mb-4">{t('Totals.description')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Totals />
        </div>
      </div>
    </div>
  )
}
