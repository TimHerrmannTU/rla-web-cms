import 'dotenv/config'
import { writeMigrationJson } from '../lib/migration-store'
import { fetchAllFromWordPress } from '../lib/wp-client'

// Source is ONLY the WordPress `news` CPT — never the 1_php_tim sibling repo's `web` MySQL
// database / `aktuell` table. Must be run on a machine with LAN access to the WP host.
async function run() {
  const records = await fetchAllFromWordPress('news')
  writeMigrationJson('news_raw.json', records)
  console.log('News raw data successfully saved to: migration/news_raw.json')
}

run().catch((error) => {
  console.error('News extraction failed:', error)
  process.exit(1)
})
