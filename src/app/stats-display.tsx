'use client'

import { useAuth } from '@/components/auth-provider'
import { getUserStatsAction, type Stats } from '@/app/stats-display-actions'
import { useEffect, useState } from 'react'

/**
 * Shows user-specific stats when logged in, or nothing when not logged in.
 * Never leaks total database counts to unauthenticated users.
 */
export function StatsDisplay() {
  const { hash, isLoggedIn, initialized } = useAuth()
  const [stats, setStats] = useState<null | Stats>(null)

  useEffect(() => {
    if (!initialized) return

    if (isLoggedIn && hash) {
      getUserStatsAction(hash).then((s) => {
        if (s) setStats(s)
      }).catch(() => {})
    } else {
      setStats(null)
    }
  }, [isLoggedIn, hash, initialized])

  if (!initialized || !isLoggedIn || !stats) return null

  return (
    <div className="mt-6 sm:mt-8 max-w-[42rem] leading-relaxed text-muted-foreground text-lg sm:text-xl animate-fade-in-up animation-delay-500">
      <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-blue-100/30 dark:border-blue-900/20 shadow-sm">
        You have{' '}
        <strong>
          <AnimatedCounter count={stats.groupsCount} />
        </strong>{' '}
        group{stats.groupsCount !== 1 ? 's' : ''} and{' '}
        <strong>
          <AnimatedCounter count={stats.expensesCount} />
        </strong>{' '}
        expense{stats.expensesCount !== 1 ? 's' : ''}.
      </div>
    </div>
  )
}

export function AnimatedCounter({ count }: { count: number }) {
  // Clamp start to 0 so we never show negative numbers
  const start = Math.max(0, count - 10)
  const [current, setCurrent] = useState(start)

  useEffect(() => {
    if (current < count) {
      const delay = 200 * (2 - 2 / ((current - start) / (count - start) + 1))
      setTimeout(() => setCurrent((c) => c + 1), delay)
    }
  }, [start, current, count])

  return (
    <span className="tabular-nums">
      {current.toLocaleString('en-US', { useGrouping: true })}
    </span>
  )
}
