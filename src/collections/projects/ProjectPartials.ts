import type { CollectionConfig } from 'payload'

export const ProjectPartials: CollectionConfig = {
  slug: 'projectPartial',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['name', 'project'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'project',
          type: 'relationship',
          relationTo: 'project',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
