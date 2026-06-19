import type { CollectionConfig } from 'payload'

export const ProjectPhases: CollectionConfig = {
  slug: 'projectPhase',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['id', 'name', 'project'],
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      access: {
        update: () => false,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'project',
          type: 'relationship',
          relationTo: 'project',
          required: true,
        },
        {
          name: 'phase',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
