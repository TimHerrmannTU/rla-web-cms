import 'dotenv/config'
import { getPayloadClient } from '../lib/payload-client'
import { transformNews } from './transform'
import { loadNews } from './load'

// Deliberately no wipe step and does NOT run extract.ts — News is a re-runnable sync, not
// wipe-and-reload. Every WP-sourced field (name/content/thumbnail/externalLinks) is treated as
// WP-owned and overwritten each run — don't hand-edit a synced News item in the admin UI and
// expect it to survive the next sync. Run `pnpm etl:news:extract` first (needs LAN access to
// the WP host) to (re)populate migration/news_raw.json.
async function main() {
  console.log('=== STARTING NEWS ETL PIPELINE ===\n')

  const payload = await getPayloadClient()

  await transformNews()
  await loadNews(payload)

  console.log('\n=== NEWS ETL PIPELINE COMPLETE ===')
  process.exit(0)
}

main().catch((err) => {
  console.error('\n[FATAL] News ETL pipeline failed:', err)
  process.exit(1)
})
