import type { BasePayload } from 'payload'
import { wipeCollection } from '../lib/payload-ops'

export async function wipeEmployees(payload: BasePayload): Promise<void> {
  console.log('Wiping all existing employee records from Postgres...')
  await wipeCollection(payload, 'employee')
  console.log('Wipe complete.')
}
