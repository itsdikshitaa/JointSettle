/**
 * Shared CSV parsing utilities for the dual-mode import system.
 * Supports both the app's export format and the assignment CSV format.
 */

// ─── Types ────────────────────────────────────────────────────────────────

export type CsvFormat = 'app-export' | 'assignment-csv'

export interface Anomaly {
  id: string
  row: number
  field: string
  type: string
  severity: 'error' | 'warning' | 'info'
  action: 'skipped' | 'auto-fixed' | 'flagged'
  description: string
  fix?: string
  originalValue?: string
}

export interface ImportResult {
  success: number
  anomalies: Anomaly[]
  summary: {
    totalRows: number
    imported: number
    skipped: number
    autoFixed: number
    warnings: number
    errors: number
  }
}

export interface AmbiguousDateInfo {
  originalValue: string
  ddmmResult: string
  mmddResult: string
}

// ─── Format Detection ─────────────────────────────────────────────────────

export function detectCsvFormat(rawHeaders: string[]): CsvFormat {
  const lowerHeaders = rawHeaders.map((h) => h.toLowerCase().trim())

  // Assignment CSV format has these distinctive columns
  const assignmentColumns = ['paid_by', 'split_with', 'split_details']
  const hasAssignmentColumns = assignmentColumns.some((c) =>
    lowerHeaders.some((h) => h === c),
  )

  // App export format has these distinctive columns
  const appColumns = ['split mode', 'is reimbursement', 'original cost']
  const hasAppColumns = appColumns.some((c) =>
    lowerHeaders.some((h) => h === c),
  )

  if (hasAssignmentColumns && !hasAppColumns) return 'assignment-csv'
  if (hasAppColumns) return 'app-export'

  // Fallback heuristic: if we find any of the assignment columns, use that format
  if (hasAssignmentColumns) return 'assignment-csv'

  // Default to assignment format (primary requirement)
  return 'assignment-csv'
}

// ─── Date Parsing ─────────────────────────────────────────────────────────

const MONTH_NAMES: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
}

/**
 * Parse a date string with flexible format support.
 * Returns null if the date cannot be parsed.
 * Returns 'ambiguous' if the date could be DD/MM/YYYY or MM/DD/YYYY.
 */
export function parseDate(
  dateStr: string,
  preferredFormat?: 'dd/mm' | 'mm/dd',
): Date | 'ambiguous' | null {
  const trimmed = dateStr.trim()
  if (!trimmed) return null

  // Try ISO 8601 (2026-02-01)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    return new Date(
      parseInt(isoMatch[1]),
      parseInt(isoMatch[2]) - 1,
      parseInt(isoMatch[3]),
    )
  }

  // Try YYYY/MM/DD
  const slashIsoMatch = trimmed.match(/^(\d{4})\/(\d{2})\/(\d{2})$/)
  if (slashIsoMatch) {
    return new Date(
      parseInt(slashIsoMatch[1]),
      parseInt(slashIsoMatch[2]) - 1,
      parseInt(slashIsoMatch[3]),
    )
  }

  // Try DD/MM/YYYY or MM/DD/YYYY (01/03/2026)
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const first = parseInt(slashMatch[1])
    const second = parseInt(slashMatch[2])
    const year = parseInt(slashMatch[3])

    if (preferredFormat === 'dd/mm') {
      return new Date(year, second - 1, first)
    }
    if (preferredFormat === 'mm/dd') {
      return new Date(year, first - 1, second)
    }

    // Try to infer: if first > 12, it must be day
    if (first > 12) return new Date(year, second - 1, first)
    // If second > 12, first must be month
    if (second > 12) return new Date(year, first - 1, second)
    // Both ≤ 12 → ambiguous
    return 'ambiguous'
  }

  // Try DD.MM.YYYY or MM.DD.YYYY (European vs US dot format)
  const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (dotMatch) {
    const first = parseInt(dotMatch[1])
    const second = parseInt(dotMatch[2])
    const year = parseInt(dotMatch[3])

    if (preferredFormat === 'dd/mm') {
      return new Date(year, second - 1, first)
    }
    if (preferredFormat === 'mm/dd') {
      return new Date(year, first - 1, second)
    }

    if (first > 12) return new Date(year, second - 1, first)
    if (second > 12) return new Date(year, first - 1, second)
    return 'ambiguous'
  }

  // Try text month formats:
  // "Mar 14, 2026" or "14 Mar 2026"
  const textMonthRegex =
    /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*,?\s*(\d{4})$/i
  const textMonthRegex2 =
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s*(\d{4})$/i

  const textMatch = trimmed.match(textMonthRegex)
  if (textMatch) {
    const day = parseInt(textMatch[1])
    const month = MONTH_NAMES[textMatch[2].toLowerCase().substring(0, 3)]
    const year = parseInt(textMatch[3])
    if (month !== undefined) return new Date(year, month, day)
  }

  const textMatch2 = trimmed.match(textMonthRegex2)
  if (textMatch2) {
    const month = MONTH_NAMES[textMatch2[1].toLowerCase().substring(0, 3)]
    const day = parseInt(textMatch2[2])
    const year = parseInt(textMatch2[3])
    if (month !== undefined) return new Date(year, month, day)
  }

  // Fallback: native Date parser
  const native = new Date(trimmed)
  if (!isNaN(native.getTime())) return native

  return null
}

/**
 * Detect whether a CSV has mixed date formats (inconsistent).
 */
export function detectDateFormatInconsistency(
  dateStrings: string[],
): boolean {
  const formats = new Set<string>()
  for (const ds of dateStrings) {
    const trimmed = ds.trim()
    if (!trimmed) continue
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) formats.add('iso')
    else if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) formats.add('iso-slash')
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) formats.add('slash')
    else if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(trimmed)) formats.add('dot')
    else if (/[A-Za-z]/.test(trimmed)) formats.add('text')
    else formats.add('other')
  }
  return formats.size > 1
}

/**
 * Collect all ambiguous dates from an array of date strings.
 */
export function findAmbiguousDates(dateStrings: string[]): AmbiguousDateInfo[] {
  const ambiguous: AmbiguousDateInfo[] = []
  for (const ds of dateStrings) {
    const trimmed = ds.trim()
    if (!trimmed) continue
    const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (slashMatch) {
      const first = parseInt(slashMatch[1])
      const second = parseInt(slashMatch[2])
      const year = slashMatch[3]
      if (first <= 12 && second <= 12) {
        ambiguous.push({
          originalValue: trimmed,
          ddmmResult: `${padNum(second, 2)}/${padNum(first, 2)}/${year}`,
          mmddResult: `${padNum(first, 2)}/${padNum(second, 2)}/${year}`,
        })
      }
    }
    const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    if (dotMatch) {
      const first = parseInt(dotMatch[1])
      const second = parseInt(dotMatch[2])
      const year = dotMatch[3]
      if (first <= 12 && second <= 12) {
        ambiguous.push({
          originalValue: trimmed,
          ddmmResult: `${padNum(second, 2)}.${padNum(first, 2)}.${year}`,
          mmddResult: `${padNum(first, 2)}.${padNum(second, 2)}.${year}`,
        })
      }
    }
  }
  return ambiguous
}

function padNum(n: number, len: number): string {
  return String(n).padStart(len, '0')
}

// ─── Amount Parsing ───────────────────────────────────────────────────────

/**
 * Parse an amount string, stripping commas and whitespace.
 * Returns null if unparseable.
 */
export function parseAmount(
  raw: string,
): { value: number; hadCommas: boolean } | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const hadCommas = trimmed.includes(',')
  const cleaned = trimmed.replace(/,/g, '')

  const value = parseFloat(cleaned)
  if (isNaN(value)) return null

  return { value, hadCommas }
}

/**
 * Detect if a number has excessive decimal precision (3+ decimal places).
 */
export function hasExcessivePrecision(value: number): boolean {
  const parts = value.toString().split('.')
  if (parts.length < 2) return false
  return parts[1].length >= 3
}

/**
 * Count decimal places in a number.
 */
export function countDecimalPlaces(value: number): number {
  const parts = value.toString().split('.')
  if (parts.length < 2) return 0
  return parts[1].length
}

// ─── Split Details Parsing ────────────────────────────────────────────────

export interface ParsedSplitEntry {
  participantName: string
  value: number
}

/**
 * Parse split_details string based on split_type.
 * Returns array of { participantName, value } entries.
 */
export function parseSplitDetails(
  details: string,
  splitType: string,
): ParsedSplitEntry[] | null {
  if (!details || details.trim() === '') return null

  const parts = details
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length === 0) return null

  const entries: ParsedSplitEntry[] = []

  for (const part of parts) {
    if (splitType === 'percentage') {
      // "Aisha 30%" or "Aisha 30" or "Aisha 30.5%"
      const match = part.match(/^(.+?)\s+(\d+(?:\.\d+)?)%?\s*$/i)
      if (match) {
        entries.push({
          participantName: match[1].trim(),
          value: parseFloat(match[2]),
        })
      }
    } else if (splitType === 'unequal') {
      // "Rohan 700" or "Rohan 700.50" or "Priya 1,200"
      const match = part.match(/^(.+?)\s+([\d,]+(?:\.[\d]+)?)\s*$/i)
      if (match) {
        entries.push({
          participantName: match[1].trim(),
          value: parseFloat(match[2].replace(/,/g, '')),
        })
      }
    } else if (splitType === 'share') {
      // "Aisha 1" or "Rohan 2"
      const match = part.match(/^(.+?)\s+(\d+)\s*$/i)
      if (match) {
        entries.push({
          participantName: match[1].trim(),
          value: parseInt(match[2], 10),
        })
      }
    } else {
      // equal — no details expected, or free-form
      // Try to parse anyway
      const match = part.match(/^(.+?)\s+([\d,.]+)\s*$/i)
      if (match) {
        entries.push({
          participantName: match[1].trim(),
          value: parseFloat(match[2].replace(/,/g, '')),
        })
      }
    }
  }

  return entries.length > 0 ? entries : null
}

/**
 * Split a semicolon-separated participant list into names.
 */
export function parseSplitWith(splitWith: string): string[] {
  if (!splitWith || splitWith.trim() === '') return []
  return splitWith
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
}

// ─── Split Type Mapping ───────────────────────────────────────────────────

const SPLIT_TYPE_MAP: Record<string, 'EVENLY' | 'BY_SHARES' | 'BY_PERCENTAGE' | 'BY_AMOUNT'> = {
  equal: 'EVENLY',
  evenly: 'EVENLY',
  unequal: 'BY_AMOUNT',
  unequally: 'BY_AMOUNT',
  'by amount': 'BY_AMOUNT',
  percentage: 'BY_PERCENTAGE',
  percent: 'BY_PERCENTAGE',
  share: 'BY_SHARES',
  shares: 'BY_SHARES',
  'by shares': 'BY_SHARES',
}

export const EXPORT_SPLIT_MODE_MAP: Record<string, 'EVENLY' | 'BY_SHARES' | 'BY_PERCENTAGE' | 'BY_AMOUNT'> = {
  'Evenly': 'EVENLY',
  'Unevenly – By shares': 'BY_SHARES',
  'Unevenly – By percentage': 'BY_PERCENTAGE',
  'Unevenly – By amount': 'BY_AMOUNT',
}

export function mapSplitMode(
  value: string | undefined | null,
): { mode: 'EVENLY' | 'BY_SHARES' | 'BY_PERCENTAGE' | 'BY_AMOUNT'; matched: boolean } {
  if (!value || value.trim() === '') {
    return { mode: 'EVENLY', matched: false }
  }

  const normalized = value.trim().toLowerCase()

  // Try assignment CSV format
  const mapped = SPLIT_TYPE_MAP[normalized]
  if (mapped) return { mode: mapped, matched: true }

  // Try export format
  const exportMapped = EXPORT_SPLIT_MODE_MAP[value.trim()]
  if (exportMapped) return { mode: exportMapped, matched: true }

  // Unknown — default to EVENLY
  return { mode: 'EVENLY', matched: false }
}

// ─── Participant Name Matching ────────────────────────────────────────────

export interface ParticipantMatch {
  id: string
  name: string
  exact: boolean
}

/**
 * Find a participant by name with case-insensitive matching.
 * Returns the matched participant or null.
 */
export function findParticipant(
  name: string,
  participants: Array<{ id: string; name: string }>,
): ParticipantMatch | null {
  const trimmed = name.trim().toLowerCase()
  if (!trimmed) return null

  // Try exact match (case-insensitive)
  const exact = participants.find((p) => p.name.toLowerCase() === trimmed)
  if (exact) return { id: exact.id, name: exact.name, exact: true }

  // Try starts-with match (e.g., "Priya S" matches "Priya")
  // But be careful: "Rohan" should NOT match "Rohan's friend"
  const startsWith = participants.find(
    (p) =>
      p.name.toLowerCase().startsWith(trimmed) ||
      trimmed.startsWith(p.name.toLowerCase()),
  )
  if (startsWith) return { id: startsWith.id, name: startsWith.name, exact: false }

  return null
}

// ─── Anomaly Helpers ──────────────────────────────────────────────────────

let anomalyCounter = 0

export function createAnomaly(
  row: number,
  field: string,
  type: string,
  severity: 'error' | 'warning' | 'info',
  action: 'skipped' | 'auto-fixed' | 'flagged',
  description: string,
  fix?: string,
  originalValue?: string,
): Anomaly {
  anomalyCounter++
  return {
    id: `${type}_${anomalyCounter}`,
    row,
    field,
    type,
    severity,
    action,
    description,
    fix,
    originalValue,
  }
}

export function resetAnomalyCounter() {
  anomalyCounter = 0
}
