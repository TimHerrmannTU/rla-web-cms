import type { CollectionConfig } from 'payload'

export const Publications: CollectionConfig = {
  slug: 'publication',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'year', 'category', 'author'],
  },
  fields: [
    {
      name: 'name',
      label: 'Name / Book Title',
      type: 'text',
      admin: {
        description: 'Legacy name/buch — publication titles are not localized in the legacy data.',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Legacy untertitel/buchuntertitel.',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'publicationCategory',
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
      type: 'row',
      fields: [
        {
          name: 'journal',
          label: 'Journal',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Legacy zeitschrift.',
          },
        },
        {
          name: 'publisher',
          label: 'Publisher',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Legacy verlag.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'author',
          label: 'Author',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Legacy autor.',
          },
        },
        {
          name: 'editor',
          label: 'Editor',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Legacy hrsg.',
          },
        },
      ],
    },
    {
      name: 'pages',
      type: 'text',
      admin: {
        description: 'Legacy seiten — kept as text since legacy values include ranges (e.g. "12-34").',
      },
    },
    {
      name: 'file',
      label: 'PDF',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Legacy datei.',
      },
    },
    {
      name: 'url',
      label: 'External Website',
      type: 'text',
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
  ],
}
