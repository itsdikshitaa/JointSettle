'use client'
import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'
import { AppRouterOutput } from '@/trpc/routers/_app'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'

export function RecentGroupList() {
  const { hash, isLoggedIn, initialized } = useAuth()
  const { data, isLoading } = trpc.groups.listByUser.useQuery(
    { hash: hash! },
    { enabled: isLoggedIn },
  )

  // Not initialized yet
  if (!initialized) return null

  // Not logged in - show signup prompt
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h1 className="font-bold text-2xl mb-4">My Groups</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Sign up with a unique access hash to create and manage your own groups.
          No email or personal info needed.
        </p>
        <div className="flex gap-3">
          <Button asChild className="bg-gradient-to-br from-blue-600 to-indigo-600">
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Loading user's groups
  if (isLoading) {
    return (
      <div>
        <h1 className="font-bold text-2xl mb-6">My Groups</h1>
        <p className="text-sm text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 mr-2 inline animate-spin" />
          Loading your groups...
        </p>
      </div>
    )
  }

  const groups = data?.groups ?? []

  // No groups yet
  if (groups.length === 0) {
    return (
      <div>
        <h1 className="font-bold text-2xl mb-6">My Groups</h1>
        <p className="text-muted-foreground mb-4">
          You don&apos;t have any groups yet. Create one to get started!
        </p>
        <Button asChild className="bg-gradient-to-br from-blue-600 to-indigo-600">
          <Link href="/groups/create">Create a group</Link>
        </Button>
      </div>
    )
  }

  // Show user's groups
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <h1 className="font-bold text-2xl">My Groups</h1>
        <Button asChild>
          <Link href="/groups/create">Create a group</Link>
        </Button>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {groups.map((group) => (
          <li key={group.id}>
            <GroupCard group={group} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function GroupCard({ group }: { group: NonNullable<AppRouterOutput['groups']['listByUser']['groups']>[number] }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="block rounded-xl border border-blue-100/30 dark:border-blue-900/20 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-600/10 hover:border-blue-300/40 dark:hover:border-blue-700/40"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center shrink-0">
          <span className="text-blue-700 dark:text-blue-400 font-bold">
            {group.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">
            {group.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {group._count.participants} participant{group._count.participants !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </Link>
  )
}
