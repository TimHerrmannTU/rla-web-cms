// scripts/load-to-payload.ts
import fs from 'fs'
import { BasePayload } from 'payload'

export async function loadToPayload(payload: BasePayload) {
  const processedPath = './migration/wp_processed.json'

  if (!fs.existsSync(processedPath)) {
    throw new Error(`Processed file not found at ${processedPath}`)
  }

  console.log('Fetching active office locations to build type-safe reference map...')
  const offices = await payload.find({
    collection: 'officeLocation',
    limit: 1000,
  })

  const officeIdMap = new Map<string, string | number>()
  offices.docs.forEach((doc) => {
    officeIdMap.set(String(doc.id), doc.id)
  })

  const employees = JSON.parse(fs.readFileSync(processedPath, 'utf-8'))
  console.log(`Uploading ${employees.length} records to Postgres...`)

  let createdCount = 0
  let updatedCount = 0

  for (const emp of employees) {
    try {
      let existingDocs: any[] = []

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

      const rawOfficeId = emp.office ? String(emp.office) : ''
      const officeExists = officeIdMap.has(rawOfficeId)
      const resolvedOfficeId = officeExists ? officeIdMap.get(rawOfficeId)! : null

      const normalizedEmployee = {
        ...emp,
        office: resolvedOfficeId,
      }

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

  console.log(`\nUpload complete. Created: ${createdCount}, Updated: ${updatedCount}`)
}
