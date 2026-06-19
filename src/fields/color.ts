import type { Field } from 'payload'

export const colorField: Field = {
  name: 'color',
  type: 'text',
  admin: {
    placeholder: '#55AAFF',
    description: 'hex code only',
  },
}
