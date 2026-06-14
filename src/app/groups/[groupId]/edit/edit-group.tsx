'use client'

import { LeaveGroupButton } from '@/app/groups/[groupId]/leave-group-button'
import { GroupForm } from '@/components/group-form'
import { trpc } from '@/trpc/client'
import { useAuth } from '@/components/auth-provider'
import { LogOut, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCurrentGroup } from '../current-group-context'

export const EditGroup = () => {
  const { groupId } = useCurrentGroup()
  const { hash } = useAuth()
  const t = useTranslations('Settings')
  const { data, isLoading } = trpc.groups.getDetails.useQuery({ groupId, hash: hash! })
  const { mutateAsync } = trpc.groups.update.useMutation()
  const utils = trpc.useUtils()

  if (isLoading) return <></>

  return (
    <>
      <div className="rounded-xl border border-blue-100/20 dark:border-blue-900/15 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-5 mb-4 dark:shadow-[0_0_20px_hsl(var(--primary)_/_0.06)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">{t('title')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manage group settings and participants</p>
          </div>
        </div>
      </div>
      <GroupForm
        group={data?.group}
        onSubmit={async (groupFormValues, participantId) => {
          await mutateAsync({ groupId, hash: hash!, participantId, groupFormValues })
          await utils.groups.invalidate()
        }}
        protectedParticipantIds={data?.participantsWithExpenses}
      />

      {/* Danger Zone */}
      <div className="mt-8 rounded-xl border border-red-200/30 dark:border-red-900/20 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-red-700 dark:text-red-400">Leave Group</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Remove yourself from this group</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          You can leave this group if you no longer want to participate. You can rejoin later using a shared link.
        </p>
        <LeaveGroupButton />
      </div>
    </>
  )
}
