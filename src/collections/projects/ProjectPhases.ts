import type { CollectionConfig } from 'payload'

export const ProjectPhases: CollectionConfig = {
  slug: 'projectPhase',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['phaseCode', 'name', 'project'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'phaseCode',
          label: 'Phase ID / Code',
          type: 'text',
          required: true,
          admin: {
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
          name: 'project',
          type: 'relationship',
          relationTo: 'project',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'phaseGroup',
          label: 'Phase Grouping',
          type: 'text',
          admin: {
            width: '50%',
            placeholder: 'e.g., Conception, Design, Execution',
          },
        },
      ],
    },
  ],
}
