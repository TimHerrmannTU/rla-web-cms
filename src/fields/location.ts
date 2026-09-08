import type { Field } from 'payload'

export const locationField: Field = {
  type: 'group',
  name: 'adress',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'coords',
          type: 'point', // GIS point field
          label: 'Location',
          admin: {
            components: {
              Field: '@/components/cms/MapFieldLoader',
            },
          },
        },
        {
          name: 'details',
          type: 'group',
          label: false,
          fields: [
            {
              name: 'country',
              type: 'text',
              localized: true,
            },
            {
              name: 'city',
              type: 'text',
              localized: true,
            },
            {
              name: 'zip',
              type: 'text',
            },
            {
              name: 'street',
              type: 'text',
            },
            {
              name: 'more',
              type: 'text',
              localized: true,
            },
          ],
          admin: {
            style: {
              flex: '0 0 500px',
              border: 'none',
              padding: '0',
              background: 'transparent',
            },
          },
        },
      ],
    },
  ],
}
