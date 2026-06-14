'use client'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/ui/button'
import { fireSuccessConfetti } from '@/lib/confetti'
import { Reimbursement } from '@/lib/balances'
import { Currency } from '@/lib/currency'
import { formatCurrency } from '@/lib/utils'
import { Participant } from '@prisma/client'
import { ArrowRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

type Props = {
  reimbursements: Reimbursement[]
  participants: Participant[]
  currency: Currency
  groupId: string
}

export function ReimbursementList({
  reimbursements,
  participants,
  currency,
  groupId,
}: Props) {
  const locale = useLocale()
  const t = useTranslations('Balances.Reimbursements')
  if (reimbursements.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🎉</div>
        <p className="text-sm text-muted-foreground">{t('noReimbursements')}</p>
      </div>
    )
  }

  const getParticipant = (id: string) => participants.find((p) => p.id === id)

  return (
    <div className="space-y-3">
      {reimbursements.map((reimbursement, index) => {
        const from = getParticipant(reimbursement.from)
        const to = getParticipant(reimbursement.to)
        if (!from || !to) return null

        return (
          <div
            key={index}
            className="rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/8 dark:hover:shadow-blue-600/8 animate-fade-in-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center gap-3">
              <Avatar name={from.name} id={from.id} size="md" className="ring-2 ring-background" />

              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <strong className="font-semibold">{from.name}</strong>
                  {' '}owes{' '}
                  <strong className="font-semibold">{to.name}</strong>
                </div>
                <div className="text-lg font-bold font-heading tabular-nums text-red-600 dark:text-red-400 mt-0.5">
                  {formatCurrency(currency, reimbursement.amount, locale)}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse-soft" />
                </div>
              </div>

              <Avatar name={to.name} id={to.id} size="md" className="ring-2 ring-background" />
            </div>

            {/* Settle up button */}
            <div className="mt-3 pt-3 border-t border-blue-100/20 dark:border-blue-900/15 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="group border-emerald-200/50 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:border-emerald-300/50 dark:hover:border-emerald-700/50 transition-all duration-300 text-xs"
                asChild
                onClick={() => fireSuccessConfetti()}
              >
                <Link
                  href={`/groups/${groupId}/expenses/create?reimbursement=yes&from=${reimbursement.from}&to=${reimbursement.to}&amount=${reimbursement.amount}`}
                >
                  <span className="mr-1">✓</span>
                  {t('markAsPaid')}
                </Link>
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
