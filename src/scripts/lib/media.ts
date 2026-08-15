import type { BasePayload } from 'payload'

export interface DownloadedFile {
  data: Buffer
  mimetype: string
  name: string
  size: number
}

export async function downloadFile(url: string, filename: string): Promise<DownloadedFile> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download file from ${url}: HTTP ${response.status}`)
  }

  const data = Buffer.from(await response.arrayBuffer())
  const mimetype = response.headers.get('content-type') || 'application/octet-stream'

  return { data, mimetype, name: filename, size: data.byteLength }
}

export interface FindOrCreateMediaArgs {
  url: string
  filename: string
  alt: string
}

/** Reuses an existing Media doc matching `filename`, or downloads `url` and creates a new one. */
export async function findOrCreateMediaFromUrl(
  payload: BasePayload,
  { url, filename, alt }: FindOrCreateMediaArgs,
) {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    return existing.docs[0]
  }

  const file = await downloadFile(url, filename)

  return payload.create({
    collection: 'media',
    data: { alt },
    file,
  })
}
