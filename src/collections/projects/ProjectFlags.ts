import type { CollectionConfig } from 'payload'

export const ProjectFlags: CollectionConfig = {
  slug: 'projectFlag',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['flagCode', 'name', 'project', 'timeBudget'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'flagCode',
          label: 'Flag ID / Code',
          type: 'text',
          required: true,
          admin: {
            width: '33%',
          },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            width: '33%',
          },
        },
        {
          name: 'color',
          type: 'text',
          admin: {
            placeholder: '#FFCC00',
            width: '34%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'project',
          type: 'relationship',
          relationTo: 'project',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'timeBudget',
          label: 'Time Budget (Hours)',
          type: 'number',
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
          name: 'linkedPartial',
          type: 'relationship',
          relationTo: 'projectPartial',
          admin: {
            width: '50%',
            // Optional: Limit the dropdown selection to only partials belonging to the selected project
            condition: (data) => Boolean(data?.project),
          },
        },
        {
          name: 'linkedService',
          type: 'relationship',
          relationTo: 'projectService',
          admin: {
            width: '50%',
            condition: (data) => Boolean(data?.project),
          },
        },
      ],
    },
  ],
}
