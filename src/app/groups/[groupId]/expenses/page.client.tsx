'use client'

import { ActiveUserModal } from '@/app/groups/[groupId]/expenses/active-user-modal'
import { CreateFromReceiptButton } from '@/app/groups/[groupId]/expenses/create-from-receipt-button'
import { ExpenseList } from '@/app/groups/[groupId]/expenses/expense-list'
import { ImportCsvButton } from '@/app/groups/[groupId]/expenses/import-csv-button'
import { MiniDashboard } from '@/app/groups/[groupId]/expenses/mini-dashboard'
import { TrackPage } from '@/components/track-page'
import ExportButton from '@/app/groups/[groupId]/export-button'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCurrentGroup } from '../current-group-context'

export const revalidate = 3600

export default function GroupExpensesPageClient({
  enableReceiptExtract,
}: {
  enableReceiptExtract: boolean
}) {
  const t = useTranslations('Expenses')
  const { groupId } = useCurrentGroup()

  return (
    <>
      <TrackPage path={`/groups/${groupId}/expenses`} />

      {/* Mini Dashboard */}
      <MiniDashboard />

      {/* Expense List Container */}
      <div className="rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100/20 dark:border-blue-900/15">
          <div>
            <h2 className="font-heading font-bold text-lg">{t('title')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t('description')}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <ExportButton groupId={groupId} />
            <ImportCsvButton />
            {enableReceiptExtract && <CreateFromReceiptButton />}
            <Button asChild size="sm" className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-600/15">
              <Link
                href={`/groups/${groupId}/expenses/create`}
                title={t('create')}
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('create')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Expense List */}
        <div className="py-3">
          <ExpenseList />
        </div>
      </div>

      <ActiveUserModal groupId={groupId} />
    </>
  )
}
