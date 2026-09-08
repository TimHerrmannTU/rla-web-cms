import type { BasePayload, Where } from 'payload'
import { readMigrationJson } from '../lib/migration-store'
import { fetchOfficeLocations, buildOfficeIdLookup, resolveOfficeIdByName } from '../lib/office-resolution'
import { upsertByQuery } from '../lib/payload-ops'

export async function loadEmployees(payload: BasePayload): Promise<void> {
  const employees = readMigrationJson<Record<string, any>[]>('wp_hydrated.json')

  console.log('Fetching office locations to resolve relationships...')
  const offices = await fetchOfficeLocations(payload)
  const officeIdMap = buildOfficeIdLookup(offices)

  console.log(`Uploading ${employees.length} records to Postgres...`)

  let createdCount = 0
  let updatedCount = 0

  for (const emp of employees) {
    try {
      const where: Where = emp.email
        ? { email: { equals: emp.email } }
        : { and: [{ firstName: { equals: emp.firstName } }, { lastName: { equals: emp.lastName } }] }

      // `emp.office` is either a numeric Payload OfficeLocation ID string (hydrate.ts's legacy-SQL
      // fallback) or an office name string (transform.ts's WP `linked_office` resolution) — try
      // the numeric match first, then fall back to matching by name.
      const rawOffice = emp.office ? String(emp.office) : ''
      const resolvedOfficeId = rawOffice
        ? (officeIdMap.has(rawOffice) ? officeIdMap.get(rawOffice)! : resolveOfficeIdByName(offices, rawOffice))
        : null

      const { doc, created } = await upsertByQuery(payload, {
        collection: 'employee',
        where,
        data: { ...emp, office: resolvedOfficeId },
      })

      if (created) {
        console.log(`[CREATE] Created: ${(doc as { fullName?: string }).fullName}`)
        createdCount++
      } else {
        console.log(`[UPDATE] Updated: ${emp.firstName} ${emp.lastName}`)
        updatedCount++
      }
    } catch (error) {
      console.error(`[ERROR] Failed to import ${emp.firstName} ${emp.lastName}:`, error)
    }
  }

  console.log(`\nUpload complete. Created: ${createdCount}, Updated: ${updatedCount}`)
}
