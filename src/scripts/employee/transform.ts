import { readMigrationJson, writeMigrationJson } from '../lib/migration-store'
import { parseIsoLikeDate } from '../lib/dates'
import { resolveOfficeIdFromWpCategories } from '../lib/office-resolution'

interface RawWpRecord {
  id: number
  title?: { rendered?: string }
  categories?: number[]
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
  }
}

/** WP `mitarbeiter` raw JSON -> Payload Employee shape (migration/wp_raw.json -> wp_processed.json). */
export async function transformWpEmployees(): Promise<void> {
  const rawData = readMigrationJson<RawWpRecord[]>('wp_raw.json')
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
    const officeId = resolveOfficeIdFromWpCategories(raw.categories || [])

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
      office: officeId,

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
