import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import { locationField } from '../fields/location' // Import the reusable field

export const OfficeLocations: CollectionConfig = {
  slug: 'officeLocation',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'leader', 'content'],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // general
        {
          label: 'General',
          fields: [
            {
              name: 'name',
              type: 'text',
            },
            {
              name: 'leader',
              type: 'relationship',
              relationTo: 'employee',
              required: false,
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
              }),
            },
          ],
        },
        // location
        {
          label: 'Location',
          fields: [locationField],
        },
        // contact
        {
          label: 'Contact',
          fields: [
            {
              name: 'contact',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'tel',
                      type: 'text',
                      admin: {
                        placeholder: '+49 170 1234567',
                      },
                    },
                    {
                      name: 'fax',
                      type: 'text',
                      admin: {
                        placeholder: '+49 170 1234567',
                      },
                    },
                  ],
                },
                {
                  name: 'email',
                  type: 'email',
                },
                {
                  name: 'emailIntern',
                  type: 'email',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
