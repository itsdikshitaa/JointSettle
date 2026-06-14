import Link from 'next/link'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`group flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 shadow-lg shadow-blue-500/25 dark:shadow-blue-400/20" />
        <span className="font-heading text-lg font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
          JointSettle
        </span>
      </div>
    </Link>
  )
}
