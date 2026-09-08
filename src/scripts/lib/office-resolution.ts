import type { BasePayload } from 'payload'
import type { OfficeLocation } from '../../payload-types'
import { findAllDocs } from './payload-ops'

export async function fetchOfficeLocations(payload: BasePayload): Promise<OfficeLocation[]> {
  return findAllDocs<OfficeLocation>(payload, 'officeLocation')
}

/**
 * OfficeLocation-ID (as a string) → OfficeLocation-ID. Used for matching a source value that's
 * already a numeric Payload ID — e.g. `employee/hydrate.ts`'s legacy-SQL `standort` column fallback,
 * which happens to reuse Payload's own seeded numeric IDs.
 */
export function buildOfficeIdLookup(offices: OfficeLocation[]): Map<string, string | number> {
  const map = new Map<string, string | number>()
  offices.forEach((office) => map.set(String(office.id), office.id))
  return map
}

/**
 * Name-string → OfficeLocation-ID. Used both by legacy WerkX contracts (which only carry a
 * `location_name` string) and by the WordPress employee ETL (which resolves a `standort` post ID
 * to a name in transform.ts, since transform.ts stays offline/Payload-free by convention).
 */
export function resolveOfficeIdByName(
  offices: OfficeLocation[],
  name: string | null | undefined,
): OfficeLocation['id'] | null {
  if (!name) return null
  const normalized = name.trim().toLowerCase()
  const match = offices.find((office) => office.name?.trim().toLowerCase() === normalized)
  return match ? match.id : null
}
