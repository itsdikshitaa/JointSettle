import { CreateExpenseForm } from '@/app/groups/[groupId]/expenses/create-expense-form'
import { TrackPage } from '@/components/track-page'
import { getRuntimeFeatureFlags } from '@/lib/featureFlags'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Expense',
}

export default async function ExpensePage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  return (
    <>
      <TrackPage path={`/groups/${groupId}/expenses/create`} />
      <div className="min-h-[80dvh] flex flex-col">
        {/* Subtle backdrop gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-blue-500/5 dark:bg-blue-400/5 animate-float-slow" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-500/5 dark:bg-indigo-400/5 animate-float" style={{ animationDelay: '-2s' }} />
        </div>

        {/* Glass header */}
        <div className="relative mb-6 rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
              <span className="text-blue-700 dark:text-blue-400 font-heading font-bold text-lg">+</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl">Create Expense</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Add a new expense to the group</p>
            </div>
          </div>
        </div>

        <div className="relative flex-1">
          <CreateExpenseForm
            groupId={groupId}
            runtimeFeatureFlags={await getRuntimeFeatureFlags()}
          />
        </div>
      </div>
    </>
  )
}
