import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import { flowField } from '@/fields/flow'

export const Themes: CollectionConfig = {
  slug: 'theme',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      localized: true,
    },
    {
      name: 'thumbnail',
      label: 'Banner Image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Legacy bild.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
      }),
      admin: {
        description: 'Legacy text.',
      },
    },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'project',
      hasMany: true,
      admin: {
        description: 'Legacy projekte — pipe-delimited list of project kuerzel codes.',
      },
    },
    flowField('Legacy themen.flow column.'),
  ],
}
