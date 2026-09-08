import { readMigrationJson, writeMigrationJson } from '../lib/migration-store'
import { parseIsoLikeDate } from '../lib/dates'

interface RawWpRecord {
  id: number
  title?: { rendered?: string }
  acf?: {
    vorname?: string
    name?: string
    email?: string
    telefon?: string
    'mobil-telefon'?: string
    team?: string | null
    'uni-abschluss'?: string
    retired?: boolean | number | null
    birthday?: string
    // WP post ID into the `standort` CPT (bare number, despite the field being admin-configured
    // with return_format: object — resolved to an office name via standort_raw.json below).
    linked_office?: number | { ID?: number; id?: number } | null
  }
}

interface RawWpStandortRecord {
  id: number
  title?: { rendered?: string }
}

function buildStandortNameLookup(records: RawWpStandortRecord[]): Map<number, string> {
  const map = new Map<number, string>()
  records.forEach((record) => {
    const name = record.title?.rendered?.trim()
    if (name) map.set(record.id, name)
  })
  return map
}

type LinkedOffice = number | { ID?: number; id?: number } | null | undefined

function extractLinkedOfficeId(linkedOffice: LinkedOffice): number | null {
  if (typeof linkedOffice === 'number') return linkedOffice
  if (linkedOffice && typeof linkedOffice === 'object') {
    return linkedOffice.ID ?? linkedOffice.id ?? null
  }
  return null
}

/** WP `mitarbeiter` raw JSON -> Payload Employee shape (migration/wp_raw.json -> wp_processed.json). */
export async function transformWpEmployees(): Promise<void> {
  const rawData = readMigrationJson<RawWpRecord[]>('wp_raw.json')
  const standortNameLookup = buildStandortNameLookup(readMigrationJson<RawWpStandortRecord[]>('standort_raw.json'))
  console.log(`Processing ${rawData.length} raw WordPress records...`)

  const processedRecords: Record<string, unknown>[] = []

  for (const raw of rawData) {
    const acf = raw.acf
    if (!acf) continue

    let first = acf.vorname?.trim() || ''
    let last = acf.name?.trim() || ''

    if (!first || !last) {
      const renderedTitle = raw.title?.rendered?.trim() || ''
      const parts = renderedTitle.split(' ')
      if (parts.length >= 2) {
        first = parts[0]
        last = parts.slice(1).join(' ')
      }
    }

    if (!first && !last) continue

    const email = acf.email?.toLowerCase().trim() || null
    const birthday = parseIsoLikeDate(acf.birthday)
    const linkedOfficeId = extractLinkedOfficeId(acf.linked_office)
    const officeName = linkedOfficeId !== null ? (standortNameLookup.get(linkedOfficeId) ?? null) : null

    let formerEmployee: boolean | null = null
    let exitDate: string | null = null

    if (acf.retired !== undefined && acf.retired !== null) {
      formerEmployee = Boolean(acf.retired)
      if (formerEmployee) {
        // Fallback so Employee.ts's `werkx.formerEmployee` beforeChange hook (which derives the
        // value from whether `exit` is set) agrees with the value we've already computed here.
        exitDate = new Date().toISOString()
      }
    }

    processedRecords.push({
      firstName: first || null,
      lastName: last || null,
      birthday,
      // An office NAME string (resolved via standort_raw.json), not a numeric Payload ID —
      // load.ts resolves this by name. hydrate.ts's independent legacy-SQL fallback may instead
      // write a numeric OfficeLocation ID string into this same field when this is null.
      office: officeName,

      email,
      phone: acf.telefon?.trim() || null,
      mobilePhone: acf['mobil-telefon']?.trim() || null,

      higherEducation: {
        type: 'other',
        name: acf['uni-abschluss']?.trim() || null,
        location: null,
      },

      // Not a real Employee.ts field — Payload silently drops this on create/update. Kept as-is
      // for traceability in the intermediate JSON; not authorized to fix in this pass.
      _migrationMetadata: {
        legacyWpId: raw.id,
        wpTeam: acf.team || null,
      },

      werkx: {
        entry: null,
        exit: exitDate,
        formerEmployee,
        sollHistory: [],
      },
    })
  }

  writeMigrationJson('wp_processed.json', processedRecords)
  console.log(`WordPress processing complete. ${processedRecords.length} records.`)
}
