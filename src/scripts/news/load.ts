import type { BasePayload } from 'payload'
import path from 'path'
import { readMigrationJson } from '../lib/migration-store'
import { fetchWpMedia } from '../lib/wp-client'
import { findOrCreateMediaFromUrl } from '../lib/media'
import { htmlToLexical } from '../lib/html-to-lexical'
import { upsertByQuery } from '../lib/payload-ops'
import type { TransformedNewsItem } from './transform'

export async function loadNews(payload: BasePayload): Promise<void> {
  const items = readMigrationJson<TransformedNewsItem[]>('news_processed.json')
  console.log(`Uploading ${items.length} news records to Postgres...`)

  let createdCount = 0
  let updatedCount = 0

  for (const item of items) {
    try {
      let thumbnailId: string | number | undefined

      if (item.firstImageMediaId) {
        const media = await fetchWpMedia(item.firstImageMediaId)
        if (media) {
          const ext = path.extname(new URL(media.sourceUrl).pathname) || '.jpg'
          const doc = await findOrCreateMediaFromUrl(payload, {
            url: media.sourceUrl,
            filename: `news-${item.wpId}-${item.firstImageMediaId}${ext}`,
            // WP's alt_text is empty in practice — fall back to the news title.
            alt: media.altText || item.title,
          })
          thumbnailId = doc.id
        }
      }

      const content = await htmlToLexical(payload, item.contentHtml)

      const { created } = await upsertByQuery(payload, {
        collection: 'news',
        where: { wpId: { equals: item.wpId } },
        locale: 'de',
        data: {
          wpId: item.wpId,
          name: item.title,
          content,
          thumbnail: thumbnailId,
          externalLinks: item.externalLinks,
        },
      })

      if (created) {
        console.log(`[CREATE] Created: ${item.title}`)
        createdCount++
      } else {
        console.log(`[UPDATE] Updated: ${item.title}`)
        updatedCount++
      }
    } catch (error) {
      console.error(`[ERROR] Failed to import news item "${item.title}" (wpId ${item.wpId}):`, error)
    }
  }

  console.log(`\nUpload complete. Created: ${createdCount}, Updated: ${updatedCount}`)
}
