// scripts/extract-sql1.ts
import 'dotenv/config' // Loads your DB credentials from .env
import fs from 'fs'
import { createConnection } from 'mysql2/promise'

async function extractSql() {
  const outputDir = './migration'
  const outputPath = `${outputDir}/sql1_raw.json`

  // 1. Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 2. Connect to your legacy MySQL Database using your .env values
  console.log('Connecting to legacy SQL database...')
  const db = await createConnection({
    host: process.env.LEGACY_DB_HOST || 'localhost',
    user: process.env.LEGACY_DB_USER || 'root',
    password: process.env.LEGACY_DB_PASSWORD || 'password',
    database: process.env.LEGACY_DB_NAME || 'legacy_db',
  })

  console.log('Fetching HR / Contract records...')

  const targetTable = 'mitarbeiter'
  const [rows] = (await db.query(`SELECT * FROM ${targetTable}`)) as any[]

  console.log(`Successfully fetched ${rows.length} rows from legacy SQL.`)

  // 3. Save raw data locally
  fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2))
  console.log(`Raw SQL data dumped to: ${outputPath}`)

  await db.end()
}

extractSql().catch((error) => {
  console.error('SQL extraction failed:', error)
  process.exit(1)
})
