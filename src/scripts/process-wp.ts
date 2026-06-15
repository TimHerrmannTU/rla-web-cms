// scripts/process-wp.ts
import 'dotenv/config'
import fs from 'fs'

interface RawWpRecord {
  id: number
  title?: { rendered?: string }
  acf?: {
    vorname?: string
    name?: string // Last name in your ACF config
    email?: string
    telefon?: string
    'mobil-telefon'?: string
    team?: string | null
    'uni-abschluss'?: string
    retired?: boolean | number
    birthday?: string
  }
}

async function processWpData() {
  const rawPath = './migration/wp_raw.json'
  const processedPath = './migration/wp_processed.json'

  if (!fs.existsSync(rawPath)) {
    console.error(
      `Error: Raw file not found at ${rawPath}. Please run the extraction script first.`,
    )
    process.exit(1)
  }

  const rawData: RawWpRecord[] = JSON.parse(fs.readFileSync(rawPath, 'utf-8'))
  console.log(`Processing ${rawData.length} raw WordPress records using ACF mappings...\n`)

  const processedRecords: any[] = []
  const errors: string[] = []

  for (const raw of rawData) {
    const wpId = raw.id
    const acf = raw.acf

    if (!acf) {
      errors.push(`[WP ID: ${wpId}] Skipped: No ACF metadata found on this post.`)
      continue
    }

    // --- 1. NAME RESOLUTION ---
    let first = acf.vorname?.trim() || ''
    let last = acf.name?.trim() || '' // "name" in your config represents Last Name

    // Fallback split if ACF is completely empty
    if (!first || !last) {
      const renderedTitle = raw.title?.rendered?.trim() || ''
      const parts = renderedTitle.split(' ')
      if (parts.length >= 2) {
        first = parts[0]
        last = parts.slice(1).join(' ')
      }
    }

    // --- 2. MINIMAL VALIDATION (Require at least a name to prevent blank records) ---
    if (!first && !last) {
      errors.push(`[WP ID: ${wpId}] Skipped: Employee has no first or last name.`)
      continue
    }

    // --- 3. OPTIONAL FIELD NORMALIZATION ---
    const email = acf.email?.toLowerCase().trim() || null

    let birthday: string | null = null
    if (acf.birthday) {
      const parsedDate = new Date(acf.birthday)
      if (!isNaN(parsedDate.getTime())) {
        birthday = parsedDate.toISOString()
      }
    }

    // --- 4. MAP TO PAYLOAD SCHEMA ---
    const payloadEmployee = {
      firstName: first || null,
      lastName: last || null,
      birthday: birthday, // Now cleanly defaults to null if missing

      // Contact tab
      email: email, // Now cleanly defaults to null if missing
      phone: acf.telefon?.trim() || null,
      mobilePhone: acf['mobil-telefon']?.trim() || null,

      // Education mapping
      higherEducation: {
        type: 'other',
        name: acf['uni-abschluss']?.trim() || null,
        location: null,
      },

      _migrationMetadata: {
        legacyWpId: wpId,
        wpTeam: acf.team || null,
      },

      // HR metadata (werkx)
      werkx: {
        entry: null, // To be merged from SQL tables later
        exit: null, // To be merged from SQL tables later
        formerEmployee: Boolean(acf.retired), // Converts true_false to boolean
        sollHistory: [],
      },
    }

    processedRecords.push(payloadEmployee)
  }

  // Save the cleanly mapped records
  fs.writeFileSync(processedPath, JSON.stringify(processedRecords, null, 2))

  // --- REPORT ---
  console.log('--- PROCESSING COMPLETE ---')
  console.log(`Successfully mapped: ${processedRecords.length} records.`)
  console.log(`Failed / Skipped: ${errors.length} records.`)

  if (errors.length > 0) {
    console.log('\n--- SKIPPED RECORDS (CRITICAL ERRORS) ---')
    errors.forEach((err) => console.log(err))
  }

  console.log('\nProcessed data successfully saved to ./migration/wp_processed.json')
}

processWpData().catch(console.error)
