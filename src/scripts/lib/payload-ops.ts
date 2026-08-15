import type { BasePayload, CollectionSlug, TypedLocale, Where } from 'payload'

export interface UpsertArgs {
  collection: CollectionSlug
  where: Where
  data: Record<string, unknown>
  locale?: TypedLocale
}

export interface UpsertResult<T = Record<string, unknown>> {
  doc: T
  created: boolean
}

/** Finds one doc matching `where`; updates it if found, otherwise creates it with `data`. */
export async function upsertByQuery<T = Record<string, unknown>>(
  payload: BasePayload,
  { collection, where, data, locale }: UpsertArgs,
): Promise<UpsertResult<T>> {
  const existing = await payload.find({ collection, where, locale, limit: 1 })

  if (existing.docs.length > 0) {
    const doc = await payload.update({ collection, id: existing.docs[0].id, data, locale })
    return { doc: doc as T, created: false }
  }

  const doc = await payload.create({ collection, data, locale })
  return { doc: doc as T, created: true }
}

/** Deletes every doc in a collection. Destructive — no dry-run, no scoping. */
export async function wipeCollection(payload: BasePayload, collection: CollectionSlug): Promise<void> {
  await payload.delete({
    collection,
    where: { id: { exists: true } },
  })
}

/** Fetches up to `limit` docs from a collection in one page (no real pagination, matches prior behavior). */
export async function findAllDocs<T = Record<string, unknown>>(
  payload: BasePayload,
  collection: CollectionSlug,
  limit = 1000,
): Promise<T[]> {
  const result = await payload.find({ collection, limit })
  return result.docs as T[]
}
