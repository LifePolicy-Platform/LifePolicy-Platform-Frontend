export function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

export function formatTime(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** 後端 recallTime 為 "yyyy-MM-dd HH:mm:ss"（或 ISO 含 T） */
export function normalizeRecallTime(value: string | null | undefined): string | null {
  if (value == null || value === '') return null
  return String(value).trim().replace('T', ' ')
}

export function datePart(dateTime: string | null) {
  const normalized = normalizeRecallTime(dateTime)
  return normalized ? normalized.split(' ')[0] ?? '' : ''
}

export function timePart(dateTime: string | null) {
  const normalized = normalizeRecallTime(dateTime)
  const t = normalized ? normalized.split(' ')[1] ?? '' : ''
  return t ? t.slice(0, 5) : ''
}

export function parseDate(dateStr: string): Date | null {
  const normalized = dateStr.replace(/\//g, '-')
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}

/** 解析日期字串為當地時區的「日期」（不含時分秒） */
export function parseDateOnly(dateStr: string): Date | null {
  const normalized = dateStr.replace(/\//g, '-')
  const parts = normalized.split('-').map(Number)
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null

  const [y, m, day] = parts
  const d = new Date(y!, m! - 1, day)
  if (d.getFullYear() !== y || d.getMonth() !== m! - 1 || d.getDate() !== day) return null
  return d
}

/** 取得今天（當地時區，00:00:00） */
export function todayDateOnly(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** 兩個日期相差幾天（僅比較年月日） */
export function diffCalendarDays(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((to.getTime() - from.getTime()) / msPerDay)
}
