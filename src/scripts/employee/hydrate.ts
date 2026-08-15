import { readMigrationJson, writeMigrationJson } from '../lib/migration-store'
import { parseLegacySqlDate } from '../lib/dates'

interface SqlRow {
  name: string
  kuerzel: string
  eintritt: string | null
  soll: number | null
  austritt: string | null
  geburtsdatum: string | null
  aktiv: number
  email: string | null
  standort: number
}

function makeMatchKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Enriches wp_processed.json with legacy SQL contract/HR data (matched by email, else
 * normalized full name), writing wp_hydrated.json — a new file rather than overwriting
 * wp_processed.json in place, so re-running this stage never silently re-hydrates
 * already-hydrated data.
 */
export async function hydrateEmployeesWithSql(): Promise<void> {
  const wpEmployees = readMigrationJson<Record<string, any>[]>('wp_processed.json')
  const sqlRows = readMigrationJson<SqlRow[]>('sql1_raw.json')

  console.log('Hydrating WordPress records with legacy SQL contract dates...')

  const sqlByEmail = new Map<string, SqlRow>()
  const sqlByName = new Map<string, SqlRow>()

  sqlRows.forEach((row) => {
    if (row.email) sqlByEmail.set(row.email.toLowerCase().trim(), row)
    if (row.name) sqlByName.set(makeMatchKey(row.name), row)
  })

  const hydratedEmployees = wpEmployees.map((emp) => {
    const wpEmail = emp.email?.toLowerCase().trim()
    const wpFullName = makeMatchKey(`${emp.firstName}${emp.lastName}`)

    const sqlMatch = (wpEmail ? sqlByEmail.get(wpEmail) : null) || sqlByName.get(wpFullName)
    if (!sqlMatch) return emp

    const formerEmployee =
      emp.werkx.formerEmployee !== null && emp.werkx.formerEmployee !== undefined
        ? emp.werkx.formerEmployee
        : sqlMatch.aktiv === 0

    const birthday = emp.birthday || parseLegacySqlDate(sqlMatch.geburtsdatum)
    const entryDate = emp.werkx.entry || parseLegacySqlDate(sqlMatch.eintritt)

    let exitDate = emp.werkx.exit || parseLegacySqlDate(sqlMatch.austritt)
    if (formerEmployee && !exitDate) {
      // Satisfies Employee.ts's `werkx.formerEmployee` beforeChange hook, same as transform.ts.
      exitDate = new Date().toISOString()
    }

    // NOTE: `slug` here has no matching top-level field on Employee.ts (only `werkx.slug` does),
    // so this is silently dropped by Payload today. Pre-existing behavior, not fixed in this pass.
    const slug = emp.slug || (sqlMatch.kuerzel ? sqlMatch.kuerzel.trim() : null)
    const sqlOfficeId = sqlMatch.standort ? String(sqlMatch.standort) : null
    const office = emp.office || sqlOfficeId

    const targetHours = Number(sqlMatch.soll || 0)
    let sollHistory = emp.werkx.sollHistory || []

    if (sollHistory.length === 0 && targetHours > 0) {
      const dailyHours = targetHours / 5
      sollHistory = [
        {
          targetHours,
          start: entryDate,
          end: exitDate,
          description: 'Migrated from Legacy SQL',
          distribution: {
            mo: dailyHours,
            di: dailyHours,
            mi: dailyHours,
            do: dailyHours,
            fr: dailyHours,
            sa: 0,
            so: 0,
          },
        },
      ]
    }

    return {
      ...emp,
      slug,
      birthday,
      office,

      _migrationMetadata: {
        ...emp._migrationMetadata,
        legacyKuerzel: sqlMatch.kuerzel || null,
        legacyStandort: sqlMatch.standort || null,
      },

      werkx: { ...emp.werkx, entry: entryDate, exit: exitDate, formerEmployee, sollHistory },
    }
  })

  writeMigrationJson('wp_hydrated.json', hydratedEmployees)
  console.log('Hydration complete.')
}
