// scripts/hydrate-json.ts
import fs from 'fs'

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

function parseSqlDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  const cleaned = dateStr.trim()

  if (cleaned.startsWith('d') && cleaned.length === 9) {
    const year = cleaned.substring(1, 5)
    const month = cleaned.substring(5, 7)
    const day = cleaned.substring(7, 9)
    const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`)
    return isNaN(date.getTime()) ? null : date.toISOString()
  }

  const fallback = new Date(cleaned)
  return isNaN(fallback.getTime()) ? null : fallback.toISOString()
}

function makeMatchKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export async function hydrateJson() {
  const wpPath = './migration/wp_processed.json'
  const sqlPath = './migration/sql1_raw.json'

  if (!fs.existsSync(wpPath) || !fs.existsSync(sqlPath)) {
    throw new Error('Processed files are missing. Ensure process-wp and extract-sql1 have run.')
  }

  const wpEmployees = JSON.parse(fs.readFileSync(wpPath, 'utf-8'))
  const sqlRows: SqlRow[] = JSON.parse(fs.readFileSync(sqlPath, 'utf-8'))

  console.log(`Hydrating WordPress records with legacy SQL contract dates...`)

  const sqlByEmail = new Map<string, SqlRow>()
  const sqlByName = new Map<string, SqlRow>()

  sqlRows.forEach((row) => {
    if (row.email) {
      sqlByEmail.set(row.email.toLowerCase().trim(), row)
    }
    if (row.name) {
      sqlByName.set(makeMatchKey(row.name), row)
    }
  })

  const hydratedEmployees = wpEmployees.map((emp: any) => {
    const wpEmail = emp.email?.toLowerCase().trim()
    const wpFullName = makeMatchKey(`${emp.firstName}${emp.lastName}`)

    const sqlMatch = (wpEmail ? sqlByEmail.get(wpEmail) : null) || sqlByName.get(wpFullName)

    if (sqlMatch) {
      const formerEmployee =
        emp.werkx.formerEmployee !== null && emp.werkx.formerEmployee !== undefined
          ? emp.werkx.formerEmployee
          : sqlMatch.aktiv === 0

      const birthday = emp.birthday || parseSqlDate(sqlMatch.geburtsdatum)
      const entryDate = emp.werkx.entry || parseSqlDate(sqlMatch.eintritt)

      let exitDate = emp.werkx.exit || parseSqlDate(sqlMatch.austritt)
      if (formerEmployee && !exitDate) {
        exitDate = new Date().toISOString() // Satisfies schema hook [1.2.1]
      }

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

        werkx: {
          ...emp.werkx,
          entry: entryDate,
          exit: exitDate,
          formerEmployee: formerEmployee,
          sollHistory: sollHistory,
        },
      }
    }

    return emp
  })

  fs.writeFileSync(wpPath, JSON.stringify(hydratedEmployees, null, 2))
  console.log('Hydration complete.')
}
