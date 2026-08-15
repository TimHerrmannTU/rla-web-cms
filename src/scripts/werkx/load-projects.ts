import 'dotenv/config'
import { getPayloadClient } from '../lib/payload-client'
import { readMigrationJson } from '../lib/migration-store'
import { upsertByQuery } from '../lib/payload-ops'
import type { CollectionSlug } from 'payload'

interface WerkxProjectsMigrationData {
  projects: Record<string, unknown>[]
  phases: Record<string, unknown>[]
  partials: Record<string, unknown>[]
  services: Record<string, unknown>[]
  flags: Record<string, unknown>[]
}

// Each of these collections uses the legacy record's own `id` as its Payload PK, so upserting
// by `id` (rather than any other lookup) is correct for all five.
const SUB_COLLECTIONS: { key: keyof WerkxProjectsMigrationData; collection: CollectionSlug; label: string }[] = [
  { key: 'projects', collection: 'project', label: 'Projects' },
  { key: 'phases', collection: 'projectPhase', label: 'Project Phases' },
  { key: 'partials', collection: 'projectPartial', label: 'Project Partials' },
  { key: 'services', collection: 'projectService', label: 'Project Services' },
  { key: 'flags', collection: 'projectFlag', label: 'Project Flags' },
]

async function run() {
  const payload = await getPayloadClient()
  const migrationData = readMigrationJson<WerkxProjectsMigrationData>('werkx_projects.json')

  for (const { key, collection, label } of SUB_COLLECTIONS) {
    console.log(`Migrating ${label}...`)
    for (const item of migrationData[key]) {
      await upsertByQuery(payload, {
        collection,
        where: { id: { equals: (item as { id: unknown }).id } },
        data: item,
      })
    }
    console.log(`✅ Migrated ${migrationData[key].length} ${label}.`)
  }

  console.log('\nProject migration completed successfully.')
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nExecution stopped:', err)
    process.exit(1)
  })
