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
      name: 'timeBudget',
      type: 'number',
    },
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
    },
  ],
}
