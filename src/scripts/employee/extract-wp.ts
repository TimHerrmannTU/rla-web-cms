import 'dotenv/config'
import { writeMigrationJson } from '../lib/migration-store'
import { fetchAllFromWordPress } from '../lib/wp-client'

async function run() {
  const records = await fetchAllFromWordPress('mitarbeiter')
  writeMigrationJson('wp_raw.json', records)

  // Needed to resolve each employee's acf.linked_office (a bare standort post ID) to an office
  // name in transform.ts — only 5 standort posts exist, cheap to fetch in full.
  const standortRecords = await fetchAllFromWordPress('standort')
  writeMigrationJson('standort_raw.json', standortRecords)

  console.log('WordPress raw data successfully saved to: migration/wp_raw.json, migration/standort_raw.json')
}

run().catch((error) => {
  console.error('WordPress extraction failed:', error)
  process.exit(1)
})
