import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

export const Employees: CollectionConfig = {
  slug: 'employee',
  admin: {
    useAsTitle: 'fullName',
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
              name: 'firstName',
              type: 'text',
              required: true,
            },
            {
              name: 'lastName',
              type: 'text',
              required: true,
            },
            {
              name: 'fullName',
              type: 'text',
              admin: {
                hidden: true,
              },
              hooks: {
                beforeChange: [
                  ({ data, siblingData }) => {
                    const first = siblingData?.firstName || ''
                    const last = siblingData?.lastName || ''

                    return `${first} ${last}`.trim()
                  },
                ],
              },
            },
            {
              name: 'birthday',
              type: 'date',
              required: true,
              admin: {
                date: {
                  pickerAppearance: 'monthOnly',
                  displayFormat: 'MMMM yyyy',
                },
              },
            },
            // TODO add relationship to office location
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
              }),
            },
          ],
        },
        // education
        {
          label: 'Education',
          fields: [
            {
              name: 'higherEducation',
              type: 'text',
              admin: {
                placeholder: 'Dipl. Ing. Landscape Architecture',
              },
            },
          ],
        },
        // contact
        {
          label: 'Contact',
          fields: [
            {
              name: 'email',
              type: 'email',
              label: 'Company Email',
              required: true,
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Company Phone',
              admin: {
                placeholder: '+49 170 1234567',
                description:
                  'Please enter in international format starting with your country code.',
              },
            },
            {
              name: 'mobilePhone',
              type: 'text',
              label: 'Mobile Phone',
              admin: {
                placeholder: '+49 170 1234567',
                description:
                  'Please enter in international format starting with your country code.',
              },
            },
          ],
        },
      ],
    },
  ],
}
