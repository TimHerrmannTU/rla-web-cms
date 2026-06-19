import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'project',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['id', 'name', 'color', 'active'],
  },
  fields: [
    {
      name: 'id', // Overrides default PK to use your custom String(50) ID
      type: 'text',
      required: true,
      access: {
        update: () => false, // Prevents editing the ID after the record has been created
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'color',
      type: 'text',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'creationDate',
      type: 'date',
    },
  ],
}
