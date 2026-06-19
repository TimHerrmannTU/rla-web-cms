import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import { colorField } from '@/fields/color'

export const Employees: CollectionConfig = {
  slug: 'employee',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'birthday', 'office', 'email'],
    baseListFilter: () => ({
      'werkx.formerEmployee': {
        not_equals: true, // Hides employees where formerEmployee equals true
      },
    }),
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
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'dd.MM.yyyy',
                },
              },
            },
            {
              name: 'office',
              type: 'relationship',
              relationTo: 'officeLocation',
            },
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
              label: 'Highest Education',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'type',
                      type: 'select',
                      options: [
                        { value: 'bachelor', label: 'Bachelor' },
                        { value: 'master', label: 'Master' },
                        { value: 'diplom', label: 'Diplom' },
                        { value: 'doctor', label: 'Doctor' },
                        { value: 'professor', label: 'Professor' },
                        { value: 'vocationalTraining', label: 'Vocational Training' },
                        { value: 'other', label: 'Other' },
                      ],
                      admin: {
                        width: '20%',
                      },
                    },
                    {
                      name: 'subType',
                      type: 'select',
                      options: [
                        { value: 'art', label: 'of Arts' },
                        { value: 'sci', label: 'of Science' },
                        { value: 'eng', label: 'of Engineering' },
                        { value: 'ing', label: 'Ingenieur' },
                      ],
                      admin: {
                        width: '20%',
                        condition: (data, siblingData) =>
                          ['bachelor', 'master', 'diplom'].includes(siblingData?.type),
                      },
                    },
                    {
                      name: 'name',
                      type: 'text',
                    },
                    {
                      name: 'location',
                      type: 'text',
                      admin: {
                        placeholder: 'e.g. TU Dresden',
                      },
                    },
                  ],
                },
              ],
            },
            // TODO add Specialises in (Fachgruppen?)
            // TODO add certificates
            // TODO add chamber membership
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
        // human resources
        {
          name: 'werkx',
          label: 'WerkX',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'slug',
                  type: 'text',
                  admin: {
                    width: '150px',
                    description: 'aka Kuerzel',
                  },
                },
                colorField,
                {
                  name: 'entry',
                  label: 'Employment Start',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd.MM.yyyy',
                    },
                  },
                },
                {
                  name: 'exit',
                  label: 'Employment End',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd.MM.yyyy',
                    },
                  },
                },
                {
                  name: 'firstWorkYear',
                  type: 'number',
                  admin: { width: '150px' },
                },
                {
                  name: 'startTrackingDate',
                  type: 'date',
                },
                {
                  name: 'formerEmployee',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    hidden: true,
                  },
                  hooks: {
                    beforeChange: [({ siblingData }) => Boolean(siblingData?.exit)],
                  },
                },
              ],
            },
            // soll history
            {
              name: 'sollHistory',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'targetHours',
                      type: 'number',
                      min: 0,
                      max: 168,
                      required: true,
                    },
                    {
                      name: 'startingBalance',
                      type: 'number',
                      defaultValue: 0,
                      admin: {
                        description: 'Overtime/under-hours at the start of this period.',
                      },
                    },
                    {
                      name: 'start',
                      type: 'date',
                      admin: {
                        date: {
                          pickerAppearance: 'dayOnly',
                          displayFormat: 'dd.MM.yyyy',
                        },
                      },
                    },
                    {
                      name: 'end',
                      type: 'date',
                      admin: {
                        date: {
                          pickerAppearance: 'dayOnly',
                          displayFormat: 'dd.MM.yyyy',
                        },
                      },
                    },
                  ],
                },
                // distribution
                {
                  name: 'distribution',
                  type: 'group',
                  label: 'Daily Soll Distribution (Weights)',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'mo',
                          type: 'number',
                          min: 0,
                          defaultValue: 1,
                          label: 'MO',
                        },
                        {
                          name: 'di',
                          type: 'number',
                          min: 0,
                          defaultValue: 1,
                          label: 'DI',
                        },
                        {
                          name: 'mi',
                          type: 'number',
                          min: 0,
                          defaultValue: 1,
                          label: 'MI',
                        },
                        {
                          name: 'do',
                          type: 'number',
                          min: 0,
                          defaultValue: 1,
                          label: 'DO',
                        },
                        {
                          name: 'fr',
                          type: 'number',
                          min: 0,
                          defaultValue: 1,
                          label: 'FR',
                        },
                        {
                          name: 'sa',
                          type: 'number',
                          min: 0,
                          defaultValue: 0,
                          label: 'SA',
                        },
                        {
                          name: 'so',
                          type: 'number',
                          min: 0,
                          defaultValue: 0,
                          label: 'SO',
                        },
                      ],
                    },
                  ],
                  // We can add a simple validator to ensure they don't enter 0 for every single day
                  validate: (value: any) => {
                    const sum =
                      Number(value?.mo || 0) +
                      Number(value?.di || 0) +
                      Number(value?.mi || 0) +
                      Number(value?.do || 0) +
                      Number(value?.fr || 0) +
                      Number(value?.sa || 0) +
                      Number(value?.so || 0)

                    if (sum <= 0) {
                      return 'The total sum of weights must be greater than 0.'
                    }
                    return true
                  },
                },
                {
                  name: 'description',
                  type: 'text',
                },
              ],
            },
            // vacation claim
            {
              name: 'vacationClaims',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'year', type: 'number', min: 2010, max: 2100, required: true },
                    { name: 'days', type: 'number', required: true },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
