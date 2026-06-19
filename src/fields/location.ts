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
            },
            {
              name: 'city',
              type: 'text',
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
