import { Avatar } from '@/components/avatar'
import { Balances } from '@/lib/balances'
import { Currency } from '@/lib/currency'
import { cn, formatCurrency } from '@/lib/utils'
import { Participant } from '@prisma/client'
import { useLocale } from 'next-intl'
import { ArrowDownCircle, ArrowUpCircle, MinusCircle } from 'lucide-react'

type Props = {
  balances: Balances
  participants: Participant[]
  currency: Currency
}

export function BalancesList({ balances, participants, currency }: Props) {
  const locale = useLocale()
  const maxBalance = Math.max(
    ...Object.values(balances).map((b) => Math.abs(b.total)),
    1,
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {participants.map((participant) => {
        const balance = balances[participant.id]?.total ?? 0
        const absBalance = Math.abs(balance)
        const isPositive = balance > 0
        const isNegative = balance < 0
        const isSettled = balance === 0

        return (
          <div
            key={participant.id}
            className="rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/8 dark:hover:shadow-blue-600/8"
          >
            <div className="flex items-center gap-3">
              <Avatar
                name={participant.name}
                id={participant.id}
                size="md"
                className="ring-2 ring-background"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {participant.name}
                </div>
                <div className={cn(
                  'text-xs mt-0.5 flex items-center gap-1',
                  isSettled && 'text-muted-foreground',
                )}>
                  {isPositive && <ArrowUpCircle className="w-3 h-3 text-emerald-500" />}
                  {isNegative && <ArrowDownCircle className="w-3 h-3 text-red-500" />}
                  {isSettled && <MinusCircle className="w-3 h-3 text-muted-foreground" />}
                  <span>
                    {isSettled
                      ? 'All settled'
                      : isPositive
                        ? 'is owed'
                        : 'owes'}
                  </span>
                </div>
              </div>
              <div className={cn(
                'text-right',
                isSettled && 'text-muted-foreground',
              )}>
                <div className={cn(
                  'font-bold font-heading tabular-nums text-base',
                  isPositive && 'text-emerald-600 dark:text-emerald-400',
                  isNegative && 'text-red-600 dark:text-red-400',
                  isSettled && 'text-muted-foreground',
                )}>
                  {isPositive ? '+' : isNegative ? '-' : ''}
                  {formatCurrency(currency, absBalance, locale)}
                </div>
              </div>
            </div>

            {/* Visual balance bar */}
            {!isSettled && (
              <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-muted/30">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out',
                    isPositive
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      : 'bg-gradient-to-r from-red-400 to-red-500',
                  )}
                  style={{
                    width: `${(absBalance / maxBalance) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
