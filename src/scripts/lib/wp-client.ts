import { requireEnv } from './env'

export interface WpFetchOptions {
  /** Records per page requested from the WP REST API. Default 100. */
  perPage?: number
}

/** Paginates a WordPress REST API collection endpoint (e.g. `mitarbeiter`, `news`) until exhausted. */
export async function fetchAllFromWordPress<T = unknown>(
  cptSlug: string,
  options: WpFetchOptions = {},
): Promise<T[]> {
  const baseUrl = requireEnv('WP_BASE_URL')
  const perPage = options.perPage ?? 100

  let page = 1
  let allRecords: T[] = []
  let hasMoreData = true

  while (hasMoreData) {
    console.log(`Fetching page ${page} of "${cptSlug}" from WordPress...`)
    const response = await fetch(`${baseUrl}/${cptSlug}?per_page=${perPage}&page=${page}`)

    if (!response.ok) {
      hasMoreData = false
      break
    }

    const data = (await response.json()) as T[]
    if (data.length === 0) {
      hasMoreData = false
    } else {
      allRecords = allRecords.concat(data)
      page++
    }
  }

  console.log(`Fetched ${allRecords.length} total "${cptSlug}" records from WordPress.`)
  return allRecords
}

export interface WpMedia {
  sourceUrl: string
  altText: string
}

/** Resolves a WordPress media attachment ID to its downloadable URL, or null if unavailable. */
export async function fetchWpMedia(mediaId: number): Promise<WpMedia | null> {
  const baseUrl = requireEnv('WP_BASE_URL')
  const response = await fetch(`${baseUrl}/media/${mediaId}`)
  if (!response.ok) return null

  const data = (await response.json()) as { source_url?: string; alt_text?: string }
  if (!data.source_url) return null

  return { sourceUrl: data.source_url, altText: data.alt_text ?? '' }
}
