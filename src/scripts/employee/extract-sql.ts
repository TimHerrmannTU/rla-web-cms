import 'dotenv/config'
import { createConnection } from 'mysql2/promise'
import { writeMigrationJson } from '../lib/migration-store'

async function extractSql() {
  console.log('Connecting to legacy SQL database...')
  // NOTE: these fallbacks intentionally left as-is (pre-existing behavior, not part of this
  // refactor's scope) — unset env vars silently connect to a local root/password MySQL instance
  // rather than failing loudly. Worth a follow-up fix.
  const db = await createConnection({
    host: process.env.LEGACY_DB_HOST || 'localhost',
    user: process.env.LEGACY_DB_USER || 'root',
    password: process.env.LEGACY_DB_PASSWORD || 'password',
    database: process.env.LEGACY_DB_NAME || 'legacy_db',
  })

  console.log('Fetching HR / Contract records...')
  const targetTable = 'mitarbeiter'
  const [rows] = (await db.query(`SELECT * FROM ${targetTable}`)) as [Record<string, unknown>[], unknown]
  console.log(`Successfully fetched ${rows.length} rows from legacy SQL.`)

  writeMigrationJson('sql1_raw.json', rows)
  console.log('Raw SQL data dumped to: migration/sql1_raw.json')

  await db.end()
}

extractSql().catch((error) => {
  console.error('SQL extraction failed:', error)
  process.exit(1)
})
