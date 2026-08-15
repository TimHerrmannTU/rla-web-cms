import { readMigrationJson, writeMigrationJson } from '../lib/migration-store'
import { decodeHtmlEntities } from '../lib/text'

interface RawWpNewsRecord {
  id: number
  title: { rendered: string }
  content: { rendered: string }
  acf?: {
    bilder?: number[]
    // interner_link points to a WP `projekt` CPT post ID — no `project` relationship exists on
    // the News collection yet (and no Projects WP ETL exists to resolve it to a Payload project),
    // so this is read but intentionally not mapped. Revisit once both exist.
    interner_link?: number[] | ''
    externe_links?: { link: { title: string; url: string; target: string } }[] | null
    // Messy legacy taxonomy data (real category slugs mixed with stray single letters) with no
    // destination field on News — intentionally not mapped.
    'news-kategorie'?: string[]
  }
}

export interface TransformedNewsItem {
  wpId: number
  title: string
  contentHtml: string
  /** First image in the ACF `bilder` gallery, if any — News only has a single `thumbnail`
   *  field today, so the rest of the gallery isn't migrated (that's issue #7's flow-field work). */
  firstImageMediaId: number | null
  externalLinks: { label: string; url: string }[]
}

/** WP `news` raw JSON -> Payload News shape (migration/news_raw.json -> news_processed.json). */
export async function transformNews(): Promise<void> {
  const rawData = readMigrationJson<RawWpNewsRecord[]>('news_raw.json')
  console.log(`Processing ${rawData.length} raw WordPress news records...`)

  const transformed: TransformedNewsItem[] = rawData.map((raw) => {
    const acf = raw.acf ?? {}

    const title = decodeHtmlEntities(raw.title?.rendered?.trim() || `Untitled (WP #${raw.id})`)

    return {
      wpId: raw.id,
      title,
      contentHtml: raw.content?.rendered || '',
      firstImageMediaId: acf.bilder?.[0] ?? null,
      externalLinks: (acf.externe_links ?? []).map((entry) => ({
        label: decodeHtmlEntities(entry.link.title || entry.link.url),
        url: entry.link.url,
      })),
    }
  })

  writeMigrationJson('news_processed.json', transformed)
  console.log(`News processing complete. ${transformed.length} records.`)
}
