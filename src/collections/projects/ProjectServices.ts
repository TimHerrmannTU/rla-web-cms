import type { CollectionConfig } from 'payload'

export const ProjectServices: CollectionConfig = {
  slug: 'projectService',
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
      admin: {
        readOnly: true, // Locks the field in the Admin UI, but programmatic imports still work
      },
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
