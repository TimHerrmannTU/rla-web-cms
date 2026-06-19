// src/scripts/werkx-load-projects.ts
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

/**
 * Helper function to perform a clean upsert (insert or update)
 * while preserving custom string or integer IDs.
 */
async function upsert(payload: any, collection: string, item: any) {
  const existing = await payload.find({
    collection,
    where: {
      id: {
        equals: item.id,
      },
    },
  })

  if (existing.docs.length > 0) {
    // Document exists -> Perform Update
    return await payload.update({
      collection,
      id: item.id,
      data: item,
    })
  } else {
    // Document is missing -> Perform Create (preserving custom ID)
    return await payload.create({
      collection,
      data: item,
    })
  }
}

async function run() {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is missing. Check your .env configuration.')
  }

  const payload = await getPayload({ config })

  // Adjusted to your new folder structure: migration/werkx_projects.json
  const dataPath = path.resolve(process.cwd(), 'migration/werkx_projects.json')

  if (!fs.existsSync(dataPath)) {
    console.error(`Could not find migration data file at ${dataPath}.`)
    return
  }

  const migrationData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  // 1. Migrate Projects
  console.log('Migrating Projects...')
  for (const prj of migrationData.projects) {
    await upsert(payload, 'project', prj)
  }
  console.log(`✅ Migrated ${migrationData.projects.length} Projects.`)

  // 2. Migrate Phases
  console.log('Migrating Project Phases...')
  for (const phs of migrationData.phases) {
    await upsert(payload, 'projectPhase', phs)
  }
  console.log(`✅ Migrated ${migrationData.phases.length} Project Phases.`)

  // 3. Migrate Partials
  console.log('Migrating Project Partials...')
  for (const prt of migrationData.partials) {
    await upsert(payload, 'projectPartial', prt)
  }
  console.log(`✅ Migrated ${migrationData.partials.length} Project Partials.`)

  // 4. Migrate Services
  console.log('Migrating Project Services...')
  for (const srv of migrationData.services) {
    await upsert(payload, 'projectService', srv)
  }
  console.log(`✅ Migrated ${migrationData.services.length} Project Services.`)

  // 5. Migrate Flags
  console.log('Migrating Project Flags...')
  for (const flg of migrationData.flags) {
    await upsert(payload, 'projectFlag', flg)
  }
  console.log(`✅ Migrated ${migrationData.flags.length} Project Flags.`)

  console.log('\nProject migration completed successfully.')
}

run().catch((err) => {
  console.error('\nExecution stopped:', err.message)
})
