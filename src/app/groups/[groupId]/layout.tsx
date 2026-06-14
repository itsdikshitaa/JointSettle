import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { GroupLayoutClient } from './layout.client'

type Props = {
  params: Promise<{
    groupId: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Group name is resolved on the client side after auth check to avoid leaking
  // group names in server-rendered metadata
  const { groupId } = await params
  return {
    title: {
      default: `Group · JointSettle`,
      template: `%s · Group · JointSettle`,
    },
  }
}

export default async function GroupLayout({
  children,
  params,
}: PropsWithChildren<Props>) {
  const { groupId } = await params
  return <GroupLayoutClient groupId={groupId}>{children}</GroupLayoutClient>
}
