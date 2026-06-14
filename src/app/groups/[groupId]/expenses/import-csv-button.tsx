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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useToast } from '@/components/ui/use-toast'
import { useMediaQuery } from '@/lib/hooks'
import { trpc } from '@/trpc/client'
import { Download, Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, useRef } from 'react'
import { useCurrentGroup } from '../current-group-context'
import { useAuth } from '@/components/auth-provider'

export function ImportCsvButton() {
  const t = useTranslations('ImportCsv')
  const { groupId } = useCurrentGroup()
  const { hash } = useAuth()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [open, setOpen] = useState(false)
  const [csvContent, setCsvContent] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const { mutateAsync: importCsv, isPending } = trpc.groups.expenses.importCsv.useMutation()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      setCsvContent(event.target?.result as string)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!csvContent) return

    try {
      const res = await importCsv({
        groupId,
        hash: hash!,
        csvContent,
      })
      setResult(res)
      if (res.success > 0) {
        await utils.groups.expenses.invalidate()
        await utils.groups.balances.invalidate()
        await utils.groups.stats.invalidate()
        toast({
          description: t('toastSuccess', { count: res.success }),
        })
      }
    } catch (err: any) {
      toast({
        description: err.message || t('toastError'),
        variant: 'destructive',
      })
    }
  }

  const handleReset = () => {
    setCsvContent(null)
    setFileName('')
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const trigger = (
    <Button variant="outline" size="sm" title={t('button')} className="border-blue-200/30 dark:border-blue-800/20 hover:bg-blue-50/30 dark:hover:bg-blue-950/20">
      <Upload className="w-4 h-4 mr-1.5" />
      {t('button')}
    </Button>
  )

  const content = (
    <div className="space-y-4">
      {!csvContent ? (
        <>
          <div
            className="border-2 border-dashed border-blue-200/40 dark:border-blue-800/30 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400/50 dark:hover:border-blue-600/50 transition-colors duration-200 bg-white/30 dark:bg-white/[0.02]"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-blue-500/60 dark:text-blue-400/60" />
            <p className="text-sm font-medium mb-1">{t('dropzone.title')}</p>
            <p className="text-xs text-muted-foreground">{t('dropzone.description')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              {t('format.title')}
            </p>
            <p>{t('format.line1')}</p>
            <p>{t('format.line2')}</p>
            <p>{t('format.line3')}</p>
          </div>
        </>
      ) : result ? (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-800/30">
              <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <p className="font-medium text-sm text-emerald-700 dark:text-emerald-400">
                  {t('result.imported', { count: result.success })}
                </p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {t('result.errors', { count: result.errors.length })}
                </p>
                <div className="max-h-32 overflow-y-auto text-xs text-muted-foreground space-y-0.5">
                  {result.errors.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={handleReset} className="w-full">
            {t('result.importMore')}
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
            <FileText className="w-8 h-8 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {csvContent ? `${csvContent.split('\n').length} rows` : ''}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} className="shrink-0">
              {t('changeFile')}
            </Button>
          </div>
          <Button
            onClick={handleImport}
            disabled={isPending}
            className="w-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('importing')}</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> {t('import')}</>
            )}
          </Button>
        </>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={(newOpen) => {
        if (!newOpen) handleReset()
        setOpen(newOpen)
      }}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[500px] animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-500" />
              {t('title')}
            </DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={(newOpen) => {
      if (!newOpen) handleReset()
      setOpen(newOpen)
    }}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            {t('title')}
          </DrawerTitle>
          <DrawerDescription>{t('description')}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{content}</div>
      </DrawerContent>
    </Drawer>
  )
}
