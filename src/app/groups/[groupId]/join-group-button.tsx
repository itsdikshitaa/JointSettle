'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useMediaQuery } from '@/lib/hooks'
import { trpc } from '@/trpc/client'
import { UserPlus, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useCurrentGroup } from './current-group-context'
import { useAuth } from '@/components/auth-provider'

export function JoinGroupButton() {
  const t = useTranslations('JoinGroup')
  const { groupId, group } = useCurrentGroup()
  const { hash } = useAuth()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const utils = trpc.useUtils()

  const { mutateAsync: joinGroup, isPending } = trpc.groups.join.useMutation()

  if (!group) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    try {
      const { participant } = await joinGroup({
        groupId,
        hash: hash!,
        name: name.trim(),
      })
      // Set active user to the new participant
      localStorage.setItem(`${groupId}-activeUser`, participant.id)
      await utils.groups.invalidate()
      setOpen(false)
      setName('')
    } catch (err: any) {
      setError(err.message || 'Failed to join group')
    }
  }

  const trigger = (
    <Button size="sm" className="bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 dark:shadow-emerald-600/15">
      <UserPlus className="w-4 h-4 mr-1.5" />
      {t('join')}
    </Button>
  )

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">{t('nameLabel')}</label>
        <Input
          placeholder={t('namePlaceholder')}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          className="text-base"
          autoFocus
          maxLength={50}
        />
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
      <Button type="submit" className="w-full bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500" disabled={isPending}>
        {isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('joining')}</>
        ) : (
          <><UserPlus className="w-4 h-4 mr-2" /> {t('join')}</>
        )}
      </Button>
    </form>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[400px] animate-scale-in">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description', { groupName: group.name })}</DialogDescription>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{t('title')}</DrawerTitle>
          <DrawerDescription>{t('description', { groupName: group.name })}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">{form}</div>
        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  )
}
