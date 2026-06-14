'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/trpc/client'
import { Loader2, LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCurrentGroup } from './current-group-context'
import { useAuth } from '@/components/auth-provider'

export function LeaveGroupButton() {
  const t = useTranslations('LeaveGroup')
  const { groupId, group } = useCurrentGroup()
  const { hash } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const utils = trpc.useUtils()

  const { mutateAsync: leaveGroup, isPending } = trpc.groups.leave.useMutation()

  if (!group) return null

  const handleLeave = async () => {
    try {
      // Find the participant matching the active user
      const activeUserId = localStorage.getItem(`${groupId}-activeUser`)
      if (!activeUserId || activeUserId === 'None') {
        toast({ description: t('toastError'), variant: 'destructive' })
        return
      }

      await leaveGroup({
        groupId,
        hash: hash!,
        participantId: activeUserId,
      })

      // Clear active user for this group
      localStorage.removeItem(`${groupId}-activeUser`)
      toast({ description: t('toastSuccess') })
      setOpen(false)
      await utils.groups.invalidate()
      router.push('/groups')
    } catch (err: any) {
      toast({ description: err.message || t('toastError'), variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-red-200/50 dark:border-red-800/30 text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 hover:border-red-300/50 dark:hover:border-red-700/50 transition-all duration-300">
          <LogOut className="w-4 h-4 mr-1.5" />
          {t('leave')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] animate-scale-in">
        <DialogHeader>
          <DialogTitle>{t('confirmTitle')}</DialogTitle>
          <DialogDescription>{t('confirmDescription')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleLeave}
            disabled={isPending}
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('leaving')}</>
            ) : (
              <><LogOut className="w-4 h-4 mr-2" /> {t('leave')}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
