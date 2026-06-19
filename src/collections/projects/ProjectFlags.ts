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
      name: 'id', // Overrides default PK to use your custom VARCHAR(50) ID
      type: 'text',
      required: true,
      admin: {
        description: 'Custom string ID for this flag (e.g., FLG-BUDGET-01)',
      },
    },
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
          name: 'color',
          type: 'text',
          admin: {
            placeholder: '#FFCC00',
            width: '50%',
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
          admin: { width: '50%' },
        },
        {
          name: 'timeBudget',
          label: 'Time Budget (Hours)',
          type: 'number',
          admin: { width: '50%' },
        },
      ],
    },
    {
      // Missing relationship from MySQL project_flags.phase
      name: 'phase',
      type: 'relationship',
      relationTo: 'projectPhase',
      filterOptions: ({ data }) => {
        if (!data?.project) return true // Show all if no project is selected yet
        return {
          project: {
            equals: data.project, // Only show phases belonging to this project
          },
        }
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'linkedPartial',
          type: 'relationship',
          relationTo: 'projectPartial',
          filterOptions: ({ data }) => {
            if (!data?.project) return true
            return {
              project: {
                equals: data.project, // Only show partials belonging to this project
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
                equals: data.project, // Only show services belonging to this project
              },
            }
          },
        },
      ],
    },
  ],
}
