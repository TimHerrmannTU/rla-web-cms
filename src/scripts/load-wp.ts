// scripts/load-to-payload.ts
import 'dotenv/config' // Crucial to load your DATABASE_URI and PAYLOAD_SECRET
import fs from 'fs'
import { getPayload } from 'payload'
import config from '../payload.config' // Adjust the relative path to your payload.config.ts if necessary

async function load() {
  const processedPath = './migration/wp_processed.json'

  if (!fs.existsSync(processedPath)) {
    console.error(
      `Error: Processed file not found at ${processedPath}. Please run the processing script first.`,
    )
    process.exit(1)
  }

  // 1. Initialize Payload (this automatically connects to your Neon Postgres DB)
  console.log('Connecting to Payload & database...')
  const payload = await getPayload({ config })

  // 2. CHECK & RESOLVE REQUIRED OFFICE VALIDATION
  // Find an existing office, or create a default one to satisfy validation
  console.log('Verifying offices in database...')
  const offices = await payload.find({
    collection: 'officeLocation', // Must match the slug of your offices collection
    limit: 1,
  })

  let fallbackOfficeId: string | number

  if (offices.docs.length === 0) {
    console.log(
      'No offices found in database. Automatically creating a "Default Office" to satisfy validation...',
    )
    const defaultOffice = await payload.create({
      collection: 'officeLocation',
      data: {
        name: 'Default Office', // Satisfies the required name field
      },
    })
    fallbackOfficeId = defaultOffice.id
    console.log(`Created "Default Office" with ID: ${fallbackOfficeId}`)
  } else {
    fallbackOfficeId = offices.docs[0].id
    console.log(
      `Using existing office "${offices.docs[0].name}" (ID: ${fallbackOfficeId}) as fallback.`,
    )
  }

  // 3. Read the processed WordPress JSON
  const employees = JSON.parse(fs.readFileSync(processedPath, 'utf-8'))
  console.log(`Loaded ${employees.length} records. Beginning database import...\n`)

  let createdCount = 0
  let updatedCount = 0

  for (const emp of employees) {
    try {
      let existingDocs: any[] = []

      // 4. Check if the employee already exists in Postgres
      if (emp.email) {
        const result = await payload.find({
          collection: 'employee',
          where: {
            email: { equals: emp.email },
          },
        })
        existingDocs = result.docs
      } else {
        const result = await payload.find({
          collection: 'employee',
          where: {
            and: [{ firstName: { equals: emp.firstName } }, { lastName: { equals: emp.lastName } }],
          },
        })
        existingDocs = result.docs
      }

      // 5. Inject the required office ID
      const normalizedEmployee = {
        ...emp,
        office: fallbackOfficeId, // Satisfies "required: true" on your schema!
      }

      // 6. UPSERT logic (Create or Update)
      if (existingDocs.length > 0) {
        const recordId = existingDocs[0].id
        await payload.update({
          collection: 'employee',
          id: recordId,
          data: normalizedEmployee,
        })
        console.log(`[UPDATE] Updated: ${emp.firstName} ${emp.lastName}`)
        updatedCount++
      } else {
        const doc = await payload.create({
          collection: 'employee',
          data: normalizedEmployee,
        })
        console.log(`[CREATE] Created: ${doc.fullName}`)
        createdCount++
      }
    } catch (error) {
      console.error(`[ERROR] Failed to import ${emp.firstName} ${emp.lastName}:`, error)
    }
  }

  console.log('\n--- IMPORT COMPLETED ---')
  console.log(`Total Created: ${createdCount}`)
  console.log(`Total Updated: ${updatedCount}`)
  console.log('You can now log into your Payload /admin panel to view your employees!')

  process.exit(0)
}

load().catch((err) => {
  console.error('Fatal import error:', err)
  process.exit(1)
})
