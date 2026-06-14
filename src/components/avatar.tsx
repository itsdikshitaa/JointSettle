import { cn } from '@/lib/utils'

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-purple-500',
]

export function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash |= 0
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Avatar({
  name,
  id,
  className,
  size = 'md',
}: {
  name: string
  id: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none',
        getAvatarColor(id),
        sizeClasses[size],
        className,
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}

export function AvatarGroup({
  participants,
  max = 3,
  size = 'sm',
}: {
  participants: { id: string; name: string }[]
  max?: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const visible = participants.slice(0, max)
  const remaining = participants.length - max

  return (
    <div className="flex -space-x-1.5">
      {visible.map((p) => (
        <Avatar key={p.id} name={p.name} id={p.id} size={size} className="ring-2 ring-background" />
      ))}
      {remaining > 0 && (
        <div className={cn(
          'rounded-full flex items-center justify-center text-[10px] font-medium text-muted-foreground bg-muted ring-2 ring-background',
          size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10',
        )}>
          +{remaining}
        </div>
      )}
    </div>
  )
}
