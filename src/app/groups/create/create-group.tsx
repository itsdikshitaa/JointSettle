'use client'

import { GroupForm } from '@/components/group-form'
import { fireCreateConfetti } from '@/lib/confetti'
import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { useEffect } from 'react'

export const CreateGroup = () => {
  const { mutateAsync } = trpc.groups.create.useMutation()
  const utils = trpc.useUtils()
  const router = useRouter()
  const { hash, isLoggedIn, initialized } = useAuth()

  useEffect(() => {
    if (initialized && !isLoggedIn) {
      router.push('/login')
    }
  }, [initialized, isLoggedIn, router])

  if (!initialized || !isLoggedIn) {
    return null
  }

  return (
    <GroupForm
      onSubmit={async (groupFormValues) => {
        const { groupId } = await mutateAsync({ groupFormValues, hash: hash! })
        await utils.groups.invalidate()
        fireCreateConfetti()
        router.push(`/groups/${groupId}`)
      }}
    />
  )
}
