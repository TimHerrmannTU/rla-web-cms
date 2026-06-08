import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

export const Mines: CollectionConfig = {
  slug: 'mine',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'location',
      type: 'point',
      label: 'Location',
      admin: {
        components: {
          Field: '@/components/MapField#MapField', // Path to your component
        },
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
      }),
    },
  ],
}
