import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string; importId: string }> },
) {
  const { groupId, importId } = await params

  const log = await prisma.importLog.findUnique({
    where: { id: importId },
  })

  if (!log || log.groupId !== groupId) {
    return NextResponse.json({ error: 'Import log not found' }, { status: 404 })
  }

  // Parse the stored data for full details
  let parsedData: any = {}
  if (log.data) {
    try {
      parsedData = JSON.parse(log.data)
    } catch {
      // ignore parse errors
    }
  }

  const report = {
    importId: log.id,
    groupId: log.groupId,
    fileName: log.fileName,
    createdAt: log.createdAt.toISOString(),
    summary: {
      totalRows: log.totalRows,
      imported: log.imported,
      skipped: log.skipped,
      autoFixed: log.autoFixed,
      warnings: log.warnings,
      errors: log.errors,
      anomalyCount: log.anomalyCount,
    },
    anomalies: parsedData.anomalies || [],
    format: parsedData.format || 'unknown',
  }

  const filename = `import-report-${log.id}.json`
  return NextResponse.json(report, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
