import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

export const Awards: CollectionConfig = {
  slug: 'award',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'year', 'issuer'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      localized: true,
    },
    {
      name: 'year',
      type: 'number',
      admin: {
        description: 'Legacy jahr — used as the default sort key (newest first).',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'issuer',
      label: 'Issuer',
      type: 'text',
      localized: true,
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
      name: 'links',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              localized: true,
              required: true,
              admin: {
                width: '40%',
                placeholder: 'Auszeichnung',
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
  ],
}
