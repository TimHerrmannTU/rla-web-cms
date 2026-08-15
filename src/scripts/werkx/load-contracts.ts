import 'dotenv/config'
import { getPayloadClient } from '../lib/payload-client'
import { readMigrationJson } from '../lib/migration-store'
import { fetchOfficeLocations, resolveOfficeIdByName } from '../lib/office-resolution'
import { findEmployeeMatch } from '../lib/employee-match'
import { findAllDocs } from '../lib/payload-ops'
import type { Employee } from '../../payload-types'

interface WerkxContractData {
  name: string
  email?: string | null
  birthday?: string | null
  color?: string | null
  location_name?: string | null
  slug?: string | null
  entry?: string | null
  exit?: string | null
  firstWorkYear?: number | null
  startTrackingDate?: string | null
  // Passed straight through to Payload's array fields as-authored by the source JSON — typed
  // loosely on purpose rather than duplicating Employee.ts's nested array-item schema here.
  sollHistory?: NonNullable<Employee['werkx']>['sollHistory']
  vacationClaims?: NonNullable<Employee['werkx']>['vacationClaims']
}

async function run() {
  const payload = await getPayloadClient()
  const migrationData = readMigrationJson<Record<string, WerkxContractData>>('werkx_contracts.json')

  console.log('Fetching active Payload employees...')
  const payloadEmployees = await findAllDocs<Employee>(payload, 'employee')

  console.log('Fetching Office Locations to heal relationships...')
  const officeLocations = await fetchOfficeLocations(payload)

  console.log('Beginning intelligent upsert process (Updates & Inserts)...')

  for (const [mysqlId, mysqlData] of Object.entries(migrationData)) {
    const normalizedName = mysqlData.name.trim().toLowerCase()

    const matchedOfficeId = resolveOfficeIdByName(officeLocations, mysqlData.location_name)
    const matchedEmployee = findEmployeeMatch(payloadEmployees, {
      email: mysqlData.email,
      name: normalizedName,
    })

    if (matchedEmployee) {
      console.log(`\n[UPDATE] "${mysqlData.name}" (${mysqlId}) -> Payload ID: ${matchedEmployee.id}`)
      try {
        await payload.update({
          collection: 'employee',
          id: matchedEmployee.id,
          data: {
            office: matchedOfficeId || matchedEmployee.office,
            werkx: {
              ...matchedEmployee.werkx,
              slug: mysqlData.slug,
              color: mysqlData.color || matchedEmployee.werkx?.color,
              entry: mysqlData.entry,
              exit: mysqlData.exit,
              firstWorkYear: mysqlData.firstWorkYear,
              startTrackingDate: mysqlData.startTrackingDate,
              sollHistory: mysqlData.sollHistory,
              vacationClaims: mysqlData.vacationClaims,
            },
          },
        })
        console.log(`  ✅ Successfully updated employee details in database.`)
      } catch (err: unknown) {
        logPayloadError(err, `update employee "${mysqlData.name}" (${mysqlId})`)
        throw new Error(`Migration stopped at: "${mysqlData.name}"`)
      }
    } else {
      console.log(`\n[INSERT] "${mysqlData.name}" (${mysqlId}) is missing. Creating new document...`)

      const nameParts = mysqlData.name.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || 'Unknown'

      try {
        await payload.create({
          collection: 'employee',
          data: {
            firstName,
            lastName,
            email: mysqlData.email || undefined,
            birthday: mysqlData.birthday || undefined,
            office: matchedOfficeId || undefined,
            werkx: {
              slug: mysqlData.slug,
              color: mysqlData.color || undefined,
              entry: mysqlData.entry,
              exit: mysqlData.exit,
              firstWorkYear: mysqlData.firstWorkYear,
              startTrackingDate: mysqlData.startTrackingDate,
              sollHistory: mysqlData.sollHistory,
              vacationClaims: mysqlData.vacationClaims,
            },
          },
        })
        console.log(`  ✅ Successfully created new employee document.`)
      } catch (err: unknown) {
        logPayloadError(err, `create new employee "${mysqlData.name}" (${mysqlId})`)
        throw new Error(`Migration stopped at: "${mysqlData.name}"`)
      }
    }
  }

  console.log('\nMigration completed successfully.')
}

function logPayloadError(err: unknown, action: string) {
  console.error(`  ❌ Failed to ${action}:`)
  const payloadErr = err as { status?: number; data?: { errors?: { path: string; message: string }[] } }
  if (payloadErr.status === 400 && payloadErr.data?.errors) {
    payloadErr.data.errors.forEach((e) => console.error(`     - Field: ${e.path} | Error: ${e.message}`))
  } else {
    console.error(err)
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nExecution stopped:', err)
    process.exit(1)
  })
