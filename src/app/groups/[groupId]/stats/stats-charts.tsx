'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, getCurrencyFromGroup } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { useLocale } from 'next-intl'
import { useCurrentGroup } from '../current-group-context'
import { useAuth } from '@/components/auth-provider'
import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts'

const CHART_COLORS = [
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#06B6D4',
  '#6366F1', '#A855F7', '#D946EF', '#FB7185', '#FBBF24',
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-blue-100/30 dark:border-blue-900/20 bg-white/80 dark:bg-blue-950/80 backdrop-blur-sm px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-foreground">{label || payload[0].name}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="tabular-nums">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  )
}

export function StatsCharts() {
  const { groupId, group } = useCurrentGroup()
  const { hash } = useAuth()
  const locale = useLocale()
  // Fetch all expenses for chart data
  const { data: expensesPages, isLoading } = trpc.groups.expenses.list.useInfiniteQuery(
    { groupId, hash: hash!, limit: 500 },
    { getNextPageParam: ({ nextCursor }) => nextCursor },
  )
  const allExpenses = expensesPages?.pages.flatMap((p) => p.expenses) ?? []

  const nonReimbursement = useMemo(
    () => allExpenses.filter((e) => !e.isReimbursement),
    [allExpenses],
  )

  // Category breakdown for donut chart
  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    for (const expense of nonReimbursement) {
      const key = expense.category?.name || 'Other'
      map.set(key, (map.get(key) || 0) + expense.amount)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.abs(value) }))
      .sort((a, b) => b.value - a.value)
  }, [nonReimbursement])

  // Per-person spending for bar chart
  const perPersonData = useMemo(() => {
    const map = new Map<string, number>()
    for (const expense of nonReimbursement) {
      const name = expense.paidBy.name
      map.set(name, (map.get(name) || 0) + expense.amount)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, amount: Math.abs(value) }))
      .sort((a, b) => b.amount - a.amount)
  }, [nonReimbursement])

  // Monthly trends for line chart
  const monthlyData = useMemo(() => {
    const map = new Map<string, number>()
    for (const expense of nonReimbursement) {
      const date = new Date(expense.expenseDate)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      map.set(key, (map.get(key) || 0) + expense.amount)
    }
    return Array.from(map.entries())
      .map(([month, amount]) => ({ month, amount: Math.abs(amount) }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [nonReimbursement])

  if (!group || categoryData.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-6 dark:shadow-[0_0_15px_hsl(var(--primary)_/_0.04)]">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  const totalSpend = Math.abs(nonReimbursement.reduce((sum, e) => sum + e.amount, 0))

  const currency = getCurrencyFromGroup(group)
  const formattedTotal = formatCurrency(currency, totalSpend, locale)
  const statsTotalSpend = totalSpend > 0 ? totalSpend : 1 // prevent division by zero

  return (
    <div className="space-y-4">
      {/* Total Spending Overview */}
      <div className="rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-6 dark:shadow-[0_0_20px_hsl(var(--primary)_/_0.06)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-lg">Total Spending</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Overall group expenses</p>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold font-heading tabular-nums text-blue-700 dark:text-blue-400">
              {formattedTotal}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {nonReimbursement.length} expenses
            </p>
          </div>
        </div>
        {/* Mini bar showing category proportions */}
        <div className="flex h-2 rounded-full overflow-hidden bg-muted/50">
          {categoryData.slice(0, 8).map((cat, i) => (
            <div
              key={cat.name}
              className="h-full transition-all duration-500"
              style={{
                width: `${(cat.value / statsTotalSpend) * 100}%`,
                backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              }}
              title={`${cat.name}: ${(cat.value / 100).toLocaleString(locale)}`}
            />
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donut Chart - Spending by Category */}
        <div className="rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-6">
          <h3 className="font-heading font-bold text-sm mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                animationBegin={100}
                animationDuration={800}
              >
                {categoryData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.slice(0, 6).map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                {cat.name}
              </div>
            ))}
            {categoryData.length > 6 && (
              <span className="text-xs text-muted-foreground">+{categoryData.length - 6} more</span>
            )}
          </div>
        </div>

        {/* Bar Chart - Per-Person Spending */}
        <div className="rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-6">
          <h3 className="font-heading font-bold text-sm mb-4">Per-Person Spending</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={perPersonData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="amount"
                radius={[0, 4, 4, 0]}
                animationBegin={200}
                animationDuration={800}
              >
                {perPersonData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Monthly Trends (full width) */}
        <div className="md:col-span-2 rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-6">
          <h3 className="font-heading font-bold text-sm mb-4">Monthly Trends</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  animationBegin={300}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
              No monthly data available yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
