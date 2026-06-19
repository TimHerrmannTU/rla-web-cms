import type { CollectionConfig } from 'payload'
import { locationField } from '@/fields/location'
import { colorField } from '@/fields/color'

export const Projects: CollectionConfig = {
  slug: 'project',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['id', 'name', 'color', 'active'],
    listSearchableFields: ['name', 'id'],
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      access: {
        update: () => false,
      },
    },
    {
      name: 'creationDate',
      type: 'date',
      admin: {
        hidden: true,
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'status',
                  type: 'select',
                  options: [
                    {
                      label: 'in planning',
                      value: 'planning',
                    },
                    {
                      label: 'under construction',
                      value: 'construction',
                    },
                    {
                      label: 'done',
                      value: 'done',
                    },
                    {
                      label: 'partially done',
                      value: 'partially_done',
                    },
                    {
                      label: 'finished (Study/Competition)',
                      value: 'finished',
                    },
                    {
                      label: 'paused',
                      value: 'paused',
                    },
                    {
                      label: 'canceled',
                      value: 'canceled',
                    },
                  ],
                },
                {
                  name: 'yearCompletion',
                  type: 'number',
                  label: 'Year of Completion',
                  min: 1950,
                  max: 2200,
                  admin: {
                    description: 'can be forecast aswell ',
                  },
                },
                {
                  name: 'surfaceArea',
                  type: 'number',
                  min: 0,
                  admin: {
                    description: 'in ha',
                  },
                },
                colorField,
              ],
            },
            {
              name: 'active',
              type: 'checkbox',
              defaultValue: true,
            },
          ],
        },
        {
          label: 'Location',
          fields: [locationField],
        },
      ],
    },
  ],
}
