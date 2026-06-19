import type { CollectionConfig } from 'payload'

export const ProjectPhases: CollectionConfig = {
  slug: 'projectPhase',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['id', 'name', 'project'],
  },
  fields: [
    {
      name: 'id', // Overrides default PK to use your custom VARCHAR(50) ID
      type: 'text',
      required: true,
      admin: {
        description: 'Custom string ID for this phase (e.g., PHS-EXECUTION)',
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
    {
      name: 'phaseGroup',
      label: 'Phase Grouping',
      type: 'text',
      admin: {
        placeholder: 'e.g., Conception, Design, Execution',
      },
    },
  ],
}
