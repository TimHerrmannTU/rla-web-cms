// src/scripts/load-contract-data.ts
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

async function run() {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is missing. Check your .env configuration.')
  }

  const payload = await getPayload({ config })
  const dataPath = path.resolve(process.cwd(), 'migration_data.json')

  if (!fs.existsSync(dataPath)) {
    console.error(`Could not find migration data file at ${dataPath}.`)
    return
  }

  const migrationData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  console.log('Fetching active Payload employees from Neon...')
  const payloadEmployeesResult = await payload.find({
    collection: 'employee',
    limit: 1000,
  })
  const payloadEmployees = payloadEmployeesResult.docs

  console.log('Fetching active Office Locations from Neon to heal relationships...')
  const officeLocationsResult = await payload.find({
    collection: 'officeLocation',
    limit: 1000,
  })
  const officeLocations = officeLocationsResult.docs

  console.log('Beginning intelligent upsert process (Updates & Inserts)...')

  for (const [mysqlId, data] of Object.entries(migrationData)) {
    const mysqlData = data as any
    const normalizedName = mysqlData.name.trim().toLowerCase()
    const mysqlEmail = mysqlData.email?.trim().toLowerCase()

    // 1. Try to map location to an existing office document in Neon
    let matchedOfficeId: string | null = null
    if (mysqlData.location_name) {
      const officeDoc = officeLocations.find(
        (off) => off.name?.trim().toLowerCase() === mysqlData.location_name.trim().toLowerCase(),
      )
      if (officeDoc) {
        matchedOfficeId = officeDoc.id
      }
    }

    // 2. Try to locate existing employee in Payload
    const matchedEmployee = payloadEmployees.find((emp) => {
      if (mysqlEmail && emp.email && emp.email.trim().toLowerCase() === mysqlEmail) {
        return true
      }
      if (emp.fullName && emp.fullName.trim().toLowerCase() === normalizedName) {
        return true
      }
      const combinedName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim().toLowerCase()
      if (combinedName === normalizedName) {
        return true
      }
      return false
    })

    if (matchedEmployee) {
      // SCENARIO A: Employee exists -> Perform Update
      console.log(
        `\n[UPDATE] "${mysqlData.name}" (${mysqlId}) -> Payload ID: ${matchedEmployee.id}`,
      )
      try {
        await payload.update({
          collection: 'employee',
          id: matchedEmployee.id,
          data: {
            color: mysqlData.color || matchedEmployee.color,
            office: matchedOfficeId || matchedEmployee.office,
            vacationClaims: mysqlData.vacationClaims,
            werkx: {
              ...matchedEmployee.werkx,
              slug: mysqlData.slug,
              entry: mysqlData.entry,
              exit: mysqlData.exit,
              firstWorkYear: mysqlData.firstWorkYear, // <--- Map firstWorkYear
              startTrackingDate: mysqlData.startTrackingDate, // <--- Map startTrackingDate
              sollHistory: mysqlData.sollHistory,
            },
          },
        })
        console.log(`  ✅ Successfully updated employee details in database.`)
      } catch (err: any) {
        console.error(`  ❌ Failed to update employee "${mysqlData.name}" (${mysqlId}):`)
        if (err.status === 400 && err.data?.errors) {
          err.data.errors.forEach((e: any) => {
            console.error(`     - Field: ${e.path} | Error: ${e.message}`)
          })
        } else {
          console.error(err)
        }
        throw new Error(`Migration stopped at: "${mysqlData.name}"`)
      }
    } else {
      // SCENARIO B: Employee is missing -> Perform Insert (Create New Doc)
      console.log(
        `\n[INSERT] "${mysqlData.name}" (${mysqlId}) is missing. Creating new document...`,
      )

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
            color: mysqlData.color || undefined,
            office: matchedOfficeId || undefined,
            vacationClaims: mysqlData.vacationClaims,
            werkx: {
              slug: mysqlData.slug,
              entry: mysqlData.entry,
              exit: mysqlData.exit,
              firstWorkYear: mysqlData.firstWorkYear, // <--- Map firstWorkYear
              startTrackingDate: mysqlData.startTrackingDate, // <--- Map startTrackingDate
              sollHistory: mysqlData.sollHistory,
            },
          },
        })
        console.log(`  ✅ Successfully created new employee document.`)
      } catch (err: any) {
        console.error(`  ❌ Failed to create new employee "${mysqlData.name}" (${mysqlId}):`)
        if (err.status === 400 && err.data?.errors) {
          err.data.errors.forEach((e: any) => {
            console.error(`     - Field: ${e.path} | Error: ${e.message}`)
          })
        } else {
          console.error(err)
        }
        throw new Error(`Migration stopped at: "${mysqlData.name}"`)
      }
    }
  }

  console.log('\nMigration completed successfully.')
}

run().catch((err) => {
  console.error('\nExecution stopped:', err.message)
})
