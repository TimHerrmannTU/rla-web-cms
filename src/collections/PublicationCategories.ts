import type { CollectionConfig } from 'payload'

export const PublicationCategories: CollectionConfig = {
  slug: 'publicationCategory',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      localized: true,
      required: true,
    },
  ],
}
