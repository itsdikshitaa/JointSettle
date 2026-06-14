'use client'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

type Props = {
  groupId: string
}

const tabClasses =
  'data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-none relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-0 after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-300 data-[state=active]:after:w-3/4'

export function GroupTabs({ groupId }: Props) {
  const t = useTranslations()
  const pathname = usePathname()
  const value =
    pathname.replace(/\/groups\/[^\/]+\/([^/]+).*/, '$1') || 'expenses'
  const router = useRouter()

  return (
    <Tabs
      value={value}
      className="[&>*]:border overflow-x-auto rounded-lg bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-blue-100/30 dark:border-blue-900/20 p-1"
      onValueChange={(value) => {
        router.push(`/groups/${groupId}/${value}`)
      }}
    >
      <TabsList className="bg-transparent">
        <TabsTrigger value="expenses" className={tabClasses}>{t('Expenses.title')}</TabsTrigger>
        <TabsTrigger value="balances" className={tabClasses}>{t('Balances.title')}</TabsTrigger>
        <TabsTrigger value="information" className={tabClasses}>{t('Information.title')}</TabsTrigger>
        <TabsTrigger value="stats" className={tabClasses}>{t('Stats.title')}</TabsTrigger>
        <TabsTrigger value="activity" className={tabClasses}>{t('Activity.title')}</TabsTrigger>
        <TabsTrigger value="edit" className={tabClasses}>{t('Settings.title')}</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
