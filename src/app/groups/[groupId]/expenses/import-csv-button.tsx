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
import type { ImportResult, AmbiguousDateInfo } from '@/lib/csv-parser'
import Link from 'next/link'
import { trpc } from '@/trpc/client'
import {
  Download,
  Loader2,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react'
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
  const [result, setResult] = useState<ImportResult | null>(null)
  const [ambiguousDates, setAmbiguousDates] = useState<AmbiguousDateInfo[] | null>(null)
  const [dateFormatPreference, setDateFormatPreference] = useState<'dd/mm' | 'mm/dd' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const { mutateAsync: importCsv, isPending } = trpc.groups.expenses.importCsv.useMutation()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setResult(null)
    setAmbiguousDates(null)
    setDateFormatPreference(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      setCsvContent(event.target?.result as string)
    }
    reader.readAsText(file)
  }

  const handleImport = async (dateFormat?: 'dd/mm' | 'mm/dd') => {
    if (!csvContent) return

    try {
      const res = await importCsv({
        groupId,
        hash: hash!,
        csvContent,
        preferredDateFormat: dateFormat,
      })

      // Check if the response requires date format resolution
      if ('requiresDateFormat' in res && res.requiresDateFormat) {
        setAmbiguousDates(res.ambiguousDates)
        return
      }

      const typedResult = res
      setResult(typedResult)
      if (typedResult.success > 0) {
        await utils.groups.expenses.invalidate()
        await utils.groups.balances.invalidate()
        await utils.groups.stats.invalidate()
        toast({
          description: t('toastSuccess', { count: typedResult.success }),
        })
      }
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : t('toastError'),
        variant: 'destructive',
      })
    }
  }

  const handleReset = () => {
    setCsvContent(null)
    setFileName('')
    setResult(null)
    setAmbiguousDates(null)
    setDateFormatPreference(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const severityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
      default:
        return <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
    }
  }

  const trigger = (
    <Button
      variant="outline"
      size="sm"
      title={t('button')}
      className="border-blue-200/30 dark:border-blue-800/20 hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
    >
      <Upload className="w-4 h-4 mr-1.5" />
      {t('button')}
    </Button>
  )

  const content = (
    <div className="space-y-4">
      {!csvContent ? (
        <>
          {/* File Drop Zone */}
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

          {/* Format Info */}
          <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              {t('format.title')}
            </p>
            <p>{t('format.assignmentLine1')}</p>
            <p>{t('format.assignmentLine2')}</p>
            <p>{t('format.line3')}</p>
          </div>
        </>
      ) : ambiguousDates ? (
        <>
          {/* Date Format Picker */}
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200/30 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-950/20 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-amber-700 dark:text-amber-400 mb-1">
                    {t('ambiguousDate.title')}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {t('ambiguousDate.description')}
                  </p>
                  {ambiguousDates.slice(0, 3).map((ad, i) => (
                    <p key={i} className="text-xs text-muted-foreground font-mono">
                      {ad.originalValue} — {ad.ddmmResult} vs {ad.mmddResult}
                    </p>
                  ))}
                  {ambiguousDates.length > 3 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ...and {ambiguousDates.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => handleImport('dd/mm')}
                disabled={isPending}
                className="w-full justify-start"
              >
                {t('ambiguousDate.ddmm')}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleImport('mm/dd')}
                disabled={isPending}
                className="w-full justify-start"
              >
                {t('ambiguousDate.mmdd')}
              </Button>
            </div>

            <Button variant="ghost" onClick={handleReset} className="w-full text-xs">
              {t('changeFile')}
            </Button>
          </div>
        </>
      ) : result ? (
        <>
          {/* Results */}
          <div className="space-y-3">
            {/* Summary */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-800/30">
              <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <p className="font-medium text-sm text-emerald-700 dark:text-emerald-400">
                  {t('result.imported', { count: result.success })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('result.summary', {
                    total: result.summary.totalRows,
                    skipped: result.summary.skipped,
                    autoFixed: result.summary.autoFixed,
                    warnings: result.summary.warnings,
                    errors: result.summary.errors,
                  })}
                </p>
              </div>
            </div>

            {/* Anomalies by severity */}
            {result.anomalies.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('result.details')}
                </p>
                {result.anomalies.map((anomaly, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-lg bg-white/50 dark:bg-white/[0.02] text-xs"
                  >
                    {severityIcon(anomaly.severity)}
                    <div className="min-w-0">
                      <p className="font-medium">
                        [{t(`anomaly.severity_${anomaly.severity}`)}] {t(`anomaly.${anomaly.type}`)}
                      </p>
                      <p className="text-muted-foreground">{anomaly.description}</p>
                      {anomaly.fix && (
                        <p className="text-blue-600 dark:text-blue-400 mt-0.5">
                          → {anomaly.fix}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* View Full Report button */}
          {result.importId && (
            <Button variant="secondary" className="w-full gap-2" asChild>
              <Link href={`/groups/${groupId}/imports/${result.importId}`}>
                <FileText className="w-4 h-4" />
                {t('result.viewFullReport')}
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={handleReset} className="w-full">
            {t('result.importMore')}
          </Button>
        </>
      ) : (
        <>
          {/* Ready to Import */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
            <FileText className="w-8 h-8 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {csvContent ? `${csvContent.split('\n').length} rows` : ''}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="shrink-0"
            >
              {t('changeFile')}
            </Button>
          </div>
          <Button
            onClick={() => handleImport()}
            disabled={isPending}
            className="w-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('importing')}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" /> {t('import')}
              </>
            )}
          </Button>
        </>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) handleReset()
          setOpen(newOpen)
        }}
      >
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent
          className={
            result && result.anomalies.length > 0
              ? 'sm:max-w-[550px] animate-scale-in'
              : 'sm:max-w-[500px] animate-scale-in'
          }
        >
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
    <Drawer
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) handleReset()
        setOpen(newOpen)
      }}
    >
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
