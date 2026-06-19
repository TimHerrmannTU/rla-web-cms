import { colorField } from '@/fields/color'
import type { CollectionConfig } from 'payload'

export const ProjectFlags: CollectionConfig = {
  slug: 'projectFlag',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['id', 'name', 'project', 'timeBudget'],
  },
  fields: [
    {
      name: 'id', // Custom String(50) ID
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
          admin: {
            width: '25%',
          },
        },
        {
          name: 'timeBudget',
          type: 'number',
          admin: {
            width: '25%',
            description: 'in hours',
          },
        },
        colorField,
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
            width: '25%',
          },
        },
        {
          name: 'phase',
          type: 'text',
          admin: {
            width: '25%',
          },
        },
        {
          name: 'linkedPartial',
          type: 'relationship',
          relationTo: 'projectPartial',
          filterOptions: ({ data }) => {
            if (!data?.project) return true
            return {
              project: {
                equals: data.project,
              },
            }
          },
          admin: {
            width: '25%',
          },
        },
        {
          name: 'linkedService',
          type: 'relationship',
          relationTo: 'projectService',
          filterOptions: ({ data }) => {
            if (!data?.project) return true
            return {
              project: {
                equals: data.project,
              },
            }
          },
          admin: {
            width: '25%',
          },
        },
      ],
    },
  ],
}
