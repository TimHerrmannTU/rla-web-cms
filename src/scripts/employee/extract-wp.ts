import 'dotenv/config'
import { writeMigrationJson } from '../lib/migration-store'
import { fetchAllFromWordPress } from '../lib/wp-client'

async function run() {
  const records = await fetchAllFromWordPress('mitarbeiter')
  writeMigrationJson('wp_raw.json', records)
  console.log('WordPress raw data successfully saved to: migration/wp_raw.json')
}

run().catch((error) => {
  console.error('WordPress extraction failed:', error)
  process.exit(1)
})
