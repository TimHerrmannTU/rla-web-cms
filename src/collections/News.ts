import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'wpId',
      type: 'number',
      unique: true,
      admin: {
        hidden: true,
        description: 'WordPress news post ID — used by the News ETL for idempotent re-imports.',
      },
    },
    {
      name: 'name',
      type: 'text',
      localized: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
      }),
    },
    {
      name: 'externalLinks',
      label: 'Links',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: {
                width: '40%',
                placeholder: 'Competition Line',
              },
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: {
                width: '60%',
                placeholder: 'https://...',
              },
            },
          ],
        },
      ],
    },
    // TODO add relationship to project
  ],
}
