import type { BasePayload } from 'payload'
import type { OfficeLocation } from '../../payload-types'
import { findAllDocs } from './payload-ops'

export async function fetchOfficeLocations(payload: BasePayload): Promise<OfficeLocation[]> {
  return findAllDocs<OfficeLocation>(payload, 'officeLocation')
}

export function buildOfficeIdLookup(offices: OfficeLocation[]): Map<string, string | number> {
  const map = new Map<string, string | number>()
  offices.forEach((office) => map.set(String(office.id), office.id))
  return map
}

// Checked in this exact priority order (a record can carry multiple WP category IDs at once).
const WP_CATEGORY_PRIORITY = [626, 625, 629, 628, 627] as const
const WP_CATEGORY_TO_OFFICE_ID: Record<(typeof WP_CATEGORY_PRIORITY)[number], string> = {
  626: '2',
  625: '1',
  629: '5',
  628: '4',
  627: '3',
}

/** WP-category-ID → OfficeLocation-ID, for sources that only expose a WP taxonomy term (e.g. `mitarbeiter`). */
export function resolveOfficeIdFromWpCategories(categoryIds: number[]): string | null {
  for (const candidate of WP_CATEGORY_PRIORITY) {
    if (categoryIds.includes(candidate)) return WP_CATEGORY_TO_OFFICE_ID[candidate]
  }
  return null
}

/**
 * Name-string → OfficeLocation-ID, for sources with no ID at all (e.g. legacy WerkX contracts,
 * which only carry a `location_name` string). Deliberately a separate strategy from
 * `resolveOfficeIdFromWpCategories` rather than unified with it — the two solve different
 * problems depending on what the source data actually provides.
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
