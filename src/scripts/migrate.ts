// scripts/migrate.ts
import 'dotenv/config' // Loads your environment variables at the root level
import { getPayload } from 'payload'
import config from '../payload.config' // Adjust path if necessary

// Import your standalone modular tasks
import { wipeEmployees } from './wipe-employees'
import { processWp } from './process-wp'
import { hydrateJson } from './hydrate-json'
import { loadToPayload } from './load-to-payload'

async function main() {
  console.log('=== STARTING MODULAR MIGRATION PIPELINE ===\n')

  // 1. Initialize Payload once
  const payload = await getPayload({ config })

  // 2. Run your clean tasks sequentially
  await wipeEmployees(payload)
  await processWp()
  await hydrateJson()
  await loadToPayload(payload)

  console.log('\n=== MIGRATION PIPELINE SUCCESSFULLY EXECUTED ===')
  process.exit(0)
}

main().catch((err) => {
  console.error('\n[FATAL] Migration pipeline failed:', err)
  process.exit(1)
})
