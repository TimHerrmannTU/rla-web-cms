import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

export const OfficeLocation: CollectionConfig = {
  slug: 'officeLocation',
  admin: {
    useAsTitle: '',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
      }),
    },
    {
      name: 'location',
      type: 'point',
      label: 'Location',
      admin: {
        components: {
          Field: '@/components/cms/MapFieldLoader', // Path to your component
        },
      },
    },
  ],
}
