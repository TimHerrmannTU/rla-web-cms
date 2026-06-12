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
        // human resources
        {
          name: 'werkx',
          label: 'WerkX',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'entry',
                  label: 'Employment Start',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'd MMM yyy',
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
                      displayFormat: 'd MMM yyy',
                    },
                  },
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
                      name: 'start',
                      type: 'date',
                      admin: {
                        date: {
                          pickerAppearance: 'dayOnly',
                          displayFormat: 'd MMM yyy',
                        },
                      },
                    },
                    {
                      name: 'end',
                      type: 'date',
                      admin: {
                        date: {
                          pickerAppearance: 'dayOnly',
                          displayFormat: 'd MMM yyy',
                        },
                      },
                    },
                  ],
                },
                {
                  name: 'distribution',
                  type: 'group',
                  label: 'Daily Soll Distribution',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'mo',
                          type: 'number',
                          min: 0,
                          max: 24,
                          defaultValue: 8,
                          label: 'MO',
                        },
                        {
                          name: 'di',
                          type: 'number',
                          min: 0,
                          max: 24,
                          defaultValue: 8,
                          label: 'DI',
                        },
                        {
                          name: 'mi',
                          type: 'number',
                          min: 0,
                          max: 24,
                          defaultValue: 8,
                          label: 'MI',
                        },
                        {
                          name: 'do',
                          type: 'number',
                          min: 0,
                          max: 24,
                          defaultValue: 8,
                          label: 'DO',
                        },
                        {
                          name: 'fr',
                          type: 'number',
                          min: 0,
                          max: 24,
                          defaultValue: 8,
                          label: 'FR',
                        },
                        {
                          name: 'sa',
                          type: 'number',
                          min: 0,
                          max: 24,
                          defaultValue: 0,
                          label: 'SA',
                        },
                        {
                          name: 'so',
                          type: 'number',
                          min: 0,
                          max: 24,
                          defaultValue: 0,
                          label: 'SO',
                        },
                      ],
                    },
                  ],
                  validate: (value, { siblingData }) => {
                    const day_mo = Number(value?.mo || 0)
                    const day_di = Number(value?.di || 0)
                    const day_mi = Number(value?.mi || 0)
                    const day_do = Number(value?.do || 0)
                    const day_fr = Number(value?.fr || 0)
                    const day_sa = Number(value?.sa || 0)
                    const day_so = Number(value?.so || 0)

                    const sum = day_mo + day_di + day_mi + day_do + day_fr + day_sa + day_so

                    const target = Number(siblingData?.targetHours || 0)

                    if (sum !== target) {
                      return `The sum of daily hours (${sum}h) must exactly match the Target Hours (${target}h). Please adjust.`
                    }

                    return true
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
