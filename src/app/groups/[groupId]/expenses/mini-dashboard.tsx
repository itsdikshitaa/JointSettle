'use client'
import { Skeleton } from '@/components/ui/skeleton'
import { useActiveUser } from '@/lib/hooks'
import { getCurrencyFromGroup } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { useLocale } from 'next-intl'
import { useCurrentGroup } from '../current-group-context'
import { useAuth } from '@/components/auth-provider'
import { cn, formatCurrency } from '@/lib/utils'
import { CreditCard, TrendingUp, ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react'

export function MiniDashboard() {
  const { groupId, group } = useCurrentGroup()
  const { hash } = useAuth()
  const locale = useLocale()
  const activeUser = useActiveUser(groupId)
  const participantId = activeUser && activeUser !== 'None' ? activeUser : undefined

  const { data: balancesData } = trpc.groups.balances.list.useQuery({ groupId, hash: hash! })
  const { data: statsData } = trpc.groups.stats.get.useQuery({ groupId, hash: hash!, participantId })

  if (!group || !balancesData) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  const currency = getCurrencyFromGroup(group)
  const totalSpend = statsData?.totalGroupSpendings ?? 0
  const userBalance = participantId ? (balancesData.balances[participantId]?.total ?? 0) : 0
  const userShare = statsData?.totalParticipantShare ?? 0
  const userSpendings = statsData?.totalParticipantSpendings ?? 0

  const statCards = [
    {
      label: 'Total Spend',
      value: Math.abs(totalSpend),
      icon: CreditCard,
      color: 'text-blue-600 dark:text-blue-400',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
      iconBg: 'from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
      show: true,
    },
    {
      label: 'Your Spend',
      value: Math.abs(userSpendings),
      icon: TrendingUp,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20',
      iconBg: 'from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30',
      show: !!participantId,
    },
    {
      label: userBalance >= 0 ? "You're Owed" : 'You Owe',
      value: Math.abs(userBalance),
      icon: userBalance >= 0 ? ArrowUpCircle : ArrowDownCircle,
      color: userBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      bgGradient: userBalance >= 0
        ? 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20'
        : 'from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20',
      iconBg: userBalance >= 0
        ? 'from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30'
        : 'from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30',
      show: !!participantId,
    },
    {
      label: 'Your Share',
      value: Math.abs(userShare),
      icon: DollarSign,
      color: 'text-amber-600 dark:text-amber-400',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
      iconBg: 'from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30',
      show: !!participantId,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {statCards.filter((s) => s.show).map((stat, i) => (
        <div
          key={stat.label}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className={cn(
            'rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/8 dark:hover:shadow-blue-600/8',
            `bg-gradient-to-br ${stat.bgGradient}`,
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              <div className={cn(
                'w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center',
                stat.iconBg,
              )}>
                <stat.icon className={cn('w-3.5 h-3.5', stat.color)} />
              </div>
            </div>
            <div className={cn('text-lg sm:text-xl font-bold font-heading tabular-nums', stat.color)}>
              {formatCurrency(currency, stat.value, locale)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
