import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'project',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['projectId', 'name', 'color', 'active'],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'projectId',
                  label: 'Project ID',
                  type: 'text',
                  required: true,
                  unique: true,
                  admin: {
                    placeholder: 'e.g. PRJ-2026-001',
                    width: '50%',
                  },
                },
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'color',
                  type: 'text',
                  admin: {
                    placeholder: '#FF5555',
                    width: '33%',
                  },
                },
                {
                  name: 'creationDate',
                  type: 'date',
                  admin: {
                    width: '33%',
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd.MM.yyyy',
                    },
                  },
                },
                {
                  name: 'active',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    width: '34%',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
