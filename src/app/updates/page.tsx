import { TrackPage } from '@/components/track-page'
import { Badge } from '@/components/ui/badge'
import { getLocale } from 'next-intl/server'
import updates from './updates.json'

const categoryStyles: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30',
  improved:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/30',
  fixed:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/30',
  coming:
    'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/30',
}

const categoryLabels: Record<string, string> = {
  new: 'New',
  improved: 'Improved',
  fixed: 'Fixed',
  coming: 'Coming Soon',
}

export default async function UpdatesPage() {
  const locale = await getLocale()

  const sorted = [...updates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <main className="relative overflow-hidden py-16 md:py-24">
      <TrackPage path="/updates" />

      {/* Background gradient */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-400/5 animate-float-slow" />
        <div className="absolute top-60 -right-32 w-[30rem] h-[30rem] rounded-full bg-indigo-500/10 dark:bg-indigo-400/5 animate-float" />
      </div>

      <div className="relative mx-auto max-w-screen-md px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
          <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Latest Updates
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            What's new in JointSettle — features, improvements, and fixes.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-blue-300/50 to-transparent dark:from-blue-800 dark:via-blue-700/50 dark:to-transparent" />

          {sorted.map((update, index) => {
            const isLeft = index % 2 === 0
            return (
              <div
                key={`${update.date}-${update.title}`}
                className={`relative flex flex-col md:flex-row items-start mb-8 md:mb-12 animate-fade-in-up ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Date dot on the line */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-background shadow-sm z-10 mt-1.5" />

                {/* Spacer for alternating layout */}
                <div className="hidden md:block md:w-1/2" />

                {/* Content card */}
                <div
                  className={`ml-10 md:ml-0 md:w-1/2 ${
                    isLeft ? 'md:pr-10' : 'md:pl-10'
                  }`}
                >
                  <div className="rounded-xl border border-blue-100/30 dark:border-blue-900/20 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5 shadow-sm hover:shadow-md hover:shadow-blue-500/5 dark:hover:shadow-blue-600/5 transition-all duration-300 hover:-translate-y-0.5">
                    {/* Date */}
                    <time className="text-xs font-mono text-muted-foreground/70">
                      {formatDate(update.date, locale)}
                    </time>

                    {/* Category badge */}
                    <Badge
                      className={`ml-2 px-2 py-0.5 text-[10px] font-medium border ${
                        categoryStyles[update.category] ||
                        categoryStyles.fixed
                      }`}
                    >
                      {categoryLabels[update.category] || update.category}
                    </Badge>

                    {/* Title */}
                    <h3 className="mt-2 font-semibold text-foreground">
                      {update.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {update.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
