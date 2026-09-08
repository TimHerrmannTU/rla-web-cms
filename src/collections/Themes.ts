import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

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
    // TODO add flow/gallery field once #7 lands — legacy `flow` column renders a Flow of
    // image/text/news-ref/topic-ref blocks (see 1_php/models/flow.php), same field #7 will
    // also add to Projects and News.
  ],
}
