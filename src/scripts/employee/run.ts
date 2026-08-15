import 'dotenv/config'
import { getPayloadClient } from '../lib/payload-client'
import { wipeEmployees } from './wipe'
import { transformWpEmployees } from './transform'
import { hydrateEmployeesWithSql } from './hydrate'
import { loadEmployees } from './load'

// Deliberately does NOT run extract-wp.ts/extract-sql.ts — those need network access to the
// legacy WP/MySQL servers, which isn't guaranteed on every machine that runs this. Run them
// manually first (`pnpm etl:employees:extract-wp` / `pnpm etl:employees:extract-sql`) to
// (re)populate migration/wp_raw.json + migration/sql1_raw.json.
async function main() {
  console.log('=== STARTING EMPLOYEE ETL PIPELINE ===\n')

  const payload = await getPayloadClient()

  await wipeEmployees(payload)
  await transformWpEmployees()
  await hydrateEmployeesWithSql()
  await loadEmployees(payload)

  console.log('\n=== EMPLOYEE ETL PIPELINE COMPLETE ===')
  process.exit(0)
}

main().catch((err) => {
  console.error('\n[FATAL] Employee ETL pipeline failed:', err)
  process.exit(1)
})
