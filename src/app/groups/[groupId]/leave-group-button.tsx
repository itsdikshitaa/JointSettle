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
import { CheckCircle, Loader2, LogOut, SendHorizonal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useCurrentGroup } from './current-group-context'
import { useAuth } from '@/components/auth-provider'

export function LeaveGroupButton() {
  const t = useTranslations('LeaveGroup')
  const { groupId, group } = useCurrentGroup()
  const { hash } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [requested, setRequested] = useState(false)
  const utils = trpc.useUtils()

  const { mutateAsync: requestLeave, isPending } = trpc.groups.leave.request.useMutation()

  if (!group) return null

  const handleRequestLeave = async () => {
    try {
      // Find the participant matching the active user
      const activeUserId = localStorage.getItem(`${groupId}-activeUser`)
      if (!activeUserId || activeUserId === 'None') {
        toast({ description: t('toastError'), variant: 'destructive' })
        return
      }

      await requestLeave({
        groupId,
        hash: hash!,
        participantId: activeUserId,
      })

      setRequested(true)
      await utils.groups.invalidate()
    } catch (err) {
      toast({ description: err instanceof Error ? err.message : t('requestError'), variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setRequested(false) } }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-red-200/50 dark:border-red-800/30 text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 hover:border-red-300/50 dark:hover:border-red-700/50 transition-all duration-300">
          <LogOut className="w-4 h-4 mr-1.5" />
          {t('leave')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] animate-scale-in">
        {requested ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                {t('requestSentTitle')}
              </DialogTitle>
              <DialogDescription>
                {t('requestSentDescription')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); setRequested(false) }}>
                {t('close')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('requestTitle')}</DialogTitle>
              <DialogDescription>{t('requestDescription')}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                {t('cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleRequestLeave}
                disabled={isPending}
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('sending')}</>
                ) : (
                  <><SendHorizonal className="w-4 h-4 mr-2" /> {t('sendRequest')}</>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
