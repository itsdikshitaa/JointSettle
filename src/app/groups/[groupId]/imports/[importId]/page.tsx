'use client'

import { trpc } from '@/trpc/client'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, AlertTriangle, CheckCircle, Download, FileText, Info } from 'lucide-react'
import Link from 'next/link'
import { useCurrentGroup } from '../../current-group-context'
import type { Anomaly } from '@/lib/csv-parser'

export default function ImportReportPage() {
  const params = useParams()
  const groupId = params.groupId as string
  const importId = params.importId as string
  const { hash } = useAuth()
  const { group } = useCurrentGroup()

  const { data, isLoading } = trpc.groups.imports.get.useQuery(
    { groupId, hash: hash!, importId },
    { enabled: !!hash },
  )

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const importLog = data?.import
  if (!importLog) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-muted-foreground">Import report not found.</p>
        {group && (
          <Button variant="outline" className="mt-4" asChild>
            <Link href={`/groups/${groupId}/expenses`}>Back to Expenses</Link>
          </Button>
        )}
      </div>
    )
  }

  // Parse stored anomaly data
  let anomalies: Anomaly[] = []
  if (importLog.data) {
    try {
      const parsed = JSON.parse(importLog.data) as { anomalies?: Anomaly[] }
      anomalies = parsed.anomalies || []
    } catch {
      // ignore parse errors
    }
  }

  const errors = anomalies.filter((a) => a.severity === 'error')
  const warnings = anomalies.filter((a) => a.severity === 'warning')
  const autoFixed = anomalies.filter((a) => a.action === 'auto-fixed')

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Import Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {importLog.fileName} — {new Date(importLog.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {group && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/groups/${groupId}/expenses`}>Back to Expenses</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
              <p className="text-2xl font-bold">{importLog.totalRows}</p>
              <p className="text-xs text-muted-foreground">Total rows</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {importLog.imported}
              </p>
              <p className="text-xs text-muted-foreground">Imported</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {importLog.errors}
              </p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {importLog.warnings}
              </p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
              <p className="text-2xl font-bold">{importLog.autoFixed}</p>
              <p className="text-xs text-muted-foreground">Auto-fixed</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20">
              <p className="text-2xl font-bold">{importLog.skipped}</p>
              <p className="text-xs text-muted-foreground">Skipped</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors Section */}
      {errors.length > 0 && (
        <Card className="border-red-200/30 dark:border-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              Errors ({errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {errors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-50/30 dark:bg-red-950/10 text-sm">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">
                    [Row {err.row}] {err.type}
                  </p>
                  <p className="text-xs text-muted-foreground">{err.description}</p>
                  {err.originalValue && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Original: {err.originalValue}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <Card className="border-amber-200/30 dark:border-amber-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              Warnings ({warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50/30 dark:bg-amber-950/10 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">
                    [Row {w.row}] {w.type}
                  </p>
                  <p className="text-xs text-muted-foreground">{w.description}</p>
                  {w.fix && <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">→ {w.fix}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Auto-fixes Section */}
      {autoFixed.length > 0 && (
        <Card className="border-blue-200/30 dark:border-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-600 dark:text-blue-400">
              <Info className="w-5 h-5" />
              Auto-fixes ({autoFixed.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {autoFixed.map((af, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-blue-50/30 dark:bg-blue-950/10 text-sm">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">
                    [Row {af.row}] {af.type}
                  </p>
                  <p className="text-xs text-muted-foreground">{af.description}</p>
                  {af.fix && <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">→ {af.fix}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Download Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-blue-500" />
            Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Anomalies detected:</span>{' '}
              <span className="font-medium">{importLog.anomalyCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Import ID:</span>{' '}
              <span className="font-medium text-xs font-mono">
                {importLog.id.slice(0, 8)}…
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
              {importLog.imported} imported
            </Badge>
            {importLog.errors > 0 && (
              <Badge variant="destructive">{importLog.errors} errors</Badge>
            )}
            {importLog.warnings > 0 && (
              <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                {importLog.warnings} warnings
              </Badge>
            )}
            {importLog.autoFixed > 0 && (
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {importLog.autoFixed} auto-fixed
              </Badge>
            )}
            {importLog.skipped > 0 && (
              <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                {importLog.skipped} skipped
              </Badge>
            )}
          </div>

          <div className="mt-4">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a
                href={`/groups/${groupId}/imports/${importId}/download`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-4 h-4" />
                Download Full Report (JSON)
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
