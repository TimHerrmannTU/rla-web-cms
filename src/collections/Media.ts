import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Default',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      required: true,
    },
  ],
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 150,
        height: 150,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
