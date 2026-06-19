import type { CollectionConfig } from 'payload'

export const ProjectPartials: CollectionConfig = {
  slug: 'projectPartial',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['id', 'name', 'project'],
  },
  fields: [
    {
      name: 'id', // Overrides default PK to use your custom Integer ID
      type: 'number',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'project',
      required: true,
    },
  ],
}
