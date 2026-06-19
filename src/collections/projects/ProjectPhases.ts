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
      name: 'id', // Custom String(50) ID
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
      name: 'phase', // Matches phase column exactly (String(50))
      type: 'text',
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'project',
      required: true,
    },
  ],
}
