export interface ParsedDate {
  year: number
  month: number | null  // 1-12
  day: number | null
}

const MONTHS_EN: Record<string, number> = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
}

/**
 * Parses a date string into year/month/day components without timezone conversion.
 * Handles ISO full/partial, English month names, and year-only strings.
 * Safe against the UTC off-by-one bug of new Date("YYYY-MM-DD").
 */
export function parseDate(str: string | null | undefined): ParsedDate | null {
  if (!str) return null
  const s = str.trim()

  // ISO full: 2023-01-15, 2023-01-15T10:30:00Z, 2023-01-15T10:30:00+05:00
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) {
    const year = +m[1], month = +m[2], day = +m[3]
    if (year > 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31)
      return { year, month, day }
  }

  // ISO partial: 2023-01
  m = s.match(/^(\d{4})-(\d{2})$/)
  if (m) {
    const year = +m[1], month = +m[2]
    if (year > 1900 && year <= 2100 && month >= 1 && month <= 12)
      return { year, month, day: null }
  }

  // Year only: 2023
  m = s.match(/^(\d{4})$/)
  if (m) {
    const year = +m[1]
    if (year > 1900 && year <= 2100) return { year, month: null, day: null }
  }

  // "15 January 2023" / "15 Jan 2023"
  m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/)
  if (m) {
    const month = MONTHS_EN[m[2].toLowerCase()]
    if (month) return { year: +m[3], month, day: +m[1] }
  }

  // "January 15, 2023" / "Jan 15, 2023"
  m = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/)
  if (m) {
    const month = MONTHS_EN[m[1].toLowerCase()]
    if (month) return { year: +m[3], month, day: +m[2] }
  }

  // "January 2023" / "Jan 2023"
  m = s.match(/^([A-Za-z]+)\s+(\d{4})$/)
  if (m) {
    const month = MONTHS_EN[m[1].toLowerCase()]
    if (month) return { year: +m[2], month, day: null }
  }

  // Last resort: extract a 4-digit year from any string
  m = s.match(/\b((?:19|20)\d{2})\b/)
  if (m) return { year: +m[1], month: null, day: null }

  return null
}
