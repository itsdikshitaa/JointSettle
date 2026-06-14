'use client'
import { ActiveUserBalance } from '@/app/groups/[groupId]/expenses/active-user-balance'
import { CategoryIcon } from '@/app/groups/[groupId]/expenses/category-icon'
import { DocumentsCount } from '@/app/groups/[groupId]/expenses/documents-count'
import { Avatar } from '@/components/avatar'
import { Button } from '@/components/ui/button'
import { getGroupExpenses } from '@/lib/api'
import { Currency } from '@/lib/currency'
import { cn, formatCurrency, formatDateOnly } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fragment } from 'react'

type Expense = Awaited<ReturnType<typeof getGroupExpenses>>[number]

function Participants({
  expense,
  participantCount,
}: {
  expense: Expense
  participantCount: number
}) {
  const t = useTranslations('ExpenseCard')
  const key = expense.amount > 0 ? 'paidBy' : 'receivedBy'
  const paidFor =
    expense.paidFor.length == participantCount && participantCount >= 4 ? (
      <strong>{t('everyone')}</strong>
    ) : (
      expense.paidFor.map((paidFor, index) => (
        <Fragment key={index}>
          {index !== 0 && <>, </>}
          <strong>{paidFor.participant.name}</strong>
        </Fragment>
      ))
    )

  const participants = t.rich(key, {
    strong: (chunks) => <strong>{chunks}</strong>,
    paidBy: expense.paidBy.name,
    paidFor: () => paidFor,
    forCount: expense.paidFor.length,
  })
  return <>{participants}</>
}

function SplitIndicator({
  paidFor,
  participantCount,
}: {
  paidFor: Expense['paidFor']
  participantCount: number
}) {
  if (paidFor.length <= 1 || paidFor.length === participantCount) return null

  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <div className="flex-1 flex h-1.5 rounded-full overflow-hidden bg-muted/50">
        {paidFor.map((p, i) => (
          <div
            key={i}
            className="h-full transition-all duration-300"
            style={{
              width: `${100 / paidFor.length}%`,
              backgroundColor: `hsl(var(--primary) / ${0.3 + (i / paidFor.length) * 0.4})`,
            }}
          />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums">{paidFor.length} ways</span>
    </div>
  )
}

type Props = {
  expense: Expense
  currency: Currency
  groupId: string
  participantCount: number
}

export function ExpenseCard({
  expense,
  currency,
  groupId,
  participantCount,
}: Props) {
  const router = useRouter()
  const locale = useLocale()

  return (
    <div
      key={expense.id}
      className={cn(
        'group cursor-pointer rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm px-4 py-3.5 mx-2 sm:mx-0 mb-1.5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/8 dark:hover:shadow-blue-600/8 hover:border-blue-200/40 dark:hover:border-blue-700/30',
        expense.isReimbursement && 'italic opacity-80',
      )}
      onClick={() => {
        router.push(`/groups/${groupId}/expenses/${expense.id}/edit`)
      }}
    >
      <div className="flex items-start gap-3">
        <Avatar
          name={expense.paidBy.name}
          id={expense.paidBy.id}
          size="sm"
          className="mt-0.5 ring-2 ring-background"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className={cn(
                'text-sm font-medium truncate',
                expense.isReimbursement && 'italic',
              )}>
                <CategoryIcon
                  category={expense.category}
                  className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground"
                />
                {expense.title}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                <Participants expense={expense} participantCount={participantCount} />
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <div
                className={cn(
                  'tabular-nums whitespace-nowrap text-sm font-semibold',
                  expense.isReimbursement ? 'italic' : '',
                )}
              >
                {formatCurrency(currency, expense.amount, locale)}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {formatDateOnly(expense.expenseDate, locale, { dateStyle: 'medium' })}
              </div>
            </div>
          </div>

          <SplitIndicator paidFor={expense.paidFor} participantCount={participantCount} />
          <ActiveUserBalance {...{ groupId, currency, expense }} />
          <DocumentsCount count={expense._count.documents} />
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="self-center w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex"
          asChild
        >
          <Link href={`/groups/${groupId}/expenses/${expense.id}/edit`}>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
