import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

export const OfficeLocation: CollectionConfig = {
  slug: 'officeLocation',
  admin: {
    useAsTitle: '',
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
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
              }),
            },
            // TODO relationship to employees for office leader
          ],
        },
        // location
        {
          label: 'Location',
          fields: [
            {
              type: 'group',
              name: 'adress',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'coords',
                      type: 'point',
                      label: 'Location',
                      admin: {
                        components: {
                          Field: '@/components/cms/MapFieldLoader', // Path to your component
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
                          type: 'number',
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
            },
          ],
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
