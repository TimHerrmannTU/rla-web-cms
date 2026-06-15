// scripts/process-wp.ts
import fs from 'fs'

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

export async function processWp() {
  const rawPath = './migration/wp_raw.json'
  const processedPath = './migration/wp_processed.json'

  if (!fs.existsSync(rawPath)) {
    throw new Error(`Raw WordPress file not found at ${rawPath}`)
  }

  const rawData: RawWpRecord[] = JSON.parse(fs.readFileSync(rawPath, 'utf-8'))
  console.log(`Processing ${rawData.length} raw WordPress records...`)

  const processedRecords: any[] = []

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

    let birthday: string | null = null
    if (acf.birthday) {
      const parsedDate = new Date(acf.birthday)
      if (!isNaN(parsedDate.getTime())) {
        birthday = parsedDate.toISOString()
      }
    }

    let officeId: string | null = null
    const wpCategories = raw.categories || []
    if (wpCategories.includes(626)) officeId = '2'
    else if (wpCategories.includes(625)) officeId = '1'
    else if (wpCategories.includes(629)) officeId = '5'
    else if (wpCategories.includes(628)) officeId = '4'
    else if (wpCategories.includes(627)) officeId = '3'

    let formerEmployee: boolean | null = null
    let exitDate: string | null = null

    if (acf.retired !== undefined && acf.retired !== null) {
      formerEmployee = Boolean(acf.retired)
      if (formerEmployee) {
        exitDate = new Date().toISOString() // Fallback to satisfy hook [1.2.1]
      }
    }

    const payloadEmployee = {
      firstName: first || null,
      lastName: last || null,
      birthday: birthday,
      office: officeId,

      email: email,
      phone: acf.telefon?.trim() || null,
      mobilePhone: acf['mobil-telefon']?.trim() || null,

      higherEducation: {
        type: 'other',
        name: acf['uni-abschluss']?.trim() || null,
        location: null,
      },

      _migrationMetadata: {
        legacyWpId: raw.id,
        wpTeam: acf.team || null,
      },

      werkx: {
        entry: null,
        exit: exitDate,
        formerEmployee: formerEmployee,
        sollHistory: [],
      },
    }

    processedRecords.push(payloadEmployee)
  }

  fs.writeFileSync(processedPath, JSON.stringify(processedRecords, null, 2))
  console.log(`WordPress processing complete. Saved to: ${processedPath}`)
}
