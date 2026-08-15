/** Parses a plain ISO-ish date string, returning an ISO string or null if unparseable/absent. */
export function parseIsoLikeDate(value: string | null | undefined): string | null {
  if (!value) return null
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

/**
 * Parses legacy SQL date values, including the legacy `dYYYYMMDD` format
 * (e.g. `d20190312`), falling back to `parseIsoLikeDate` for anything else.
 */
export function parseLegacySqlDate(value: string | null | undefined): string | null {
  if (!value) return null
  const cleaned = value.trim()

  if (cleaned.startsWith('d') && cleaned.length === 9) {
    const year = cleaned.substring(1, 5)
    const month = cleaned.substring(5, 7)
    const day = cleaned.substring(7, 9)
    return parseIsoLikeDate(`${year}-${month}-${day}T00:00:00.000Z`)
  }

  return parseIsoLikeDate(cleaned)
}
