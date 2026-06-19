import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'project',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['id', 'name', 'color', 'active'],
    listSearchableFields: ['name', 'id'],
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
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'color',
          type: 'text',
        },
      ],
    },
    {
      name: 'creationDate',
      type: 'date',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
