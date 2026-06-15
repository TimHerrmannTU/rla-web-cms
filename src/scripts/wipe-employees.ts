// scripts/wipe-employees.ts
import { BasePayload } from 'payload'

export async function wipeEmployees(payload: BasePayload) {
  console.log('Wiping all existing employee records from Postgres...')

  await payload.delete({
    collection: 'employee',
    where: {
      id: { exists: true },
    },
  })

  console.log('Wipe complete.')
}
