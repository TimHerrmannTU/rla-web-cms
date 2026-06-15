// scripts/extract-wp.ts
import 'dotenv/config' // Loads environment variables if needed
import fs from 'fs'

/**
 * Handles fetching all records sequentially from WordPress's paginated REST API
 */
async function fetchAllWordPressEmployees(url: string): Promise<any[]> {
  let page = 1
  let allEmployees: any[] = []
  let hasMoreData = true

  while (hasMoreData) {
    console.log(`Fetching page ${page} from WordPress...`)

    // Request maximum (100) records per page to optimize network requests
    const response = await fetch(`${url}?per_page=100&page=${page}`)

    // WordPress returns a non-200 status (usually 400) if you request a page beyond the maximum
    if (!response.ok) {
      hasMoreData = false
      break
    }

    const data = (await response.json()) as any[]

    if (data.length === 0) {
      hasMoreData = false
    } else {
      allEmployees = allEmployees.concat(data)
      page++
    }
  }

  console.log(`\nSuccessfully fetched ${allEmployees.length} total records from WordPress API.`)
  return allEmployees
}

async function run() {
  const outputDir = './migration'
  const wpUrl = 'http://webserver/intranet/wp-json/wp/v2/mitarbeiter'

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log('Starting WordPress data extraction...')
  const wpData = await fetchAllWordPressEmployees(wpUrl)

  const outputPath = `${outputDir}/wp_raw.json`
  fs.writeFileSync(outputPath, JSON.stringify(wpData, null, 2))

  console.log(`WordPress raw data successfully saved to: ${outputPath}`)
}

run().catch((error) => {
  console.error('WordPress extraction failed:', error)
  process.exit(1)
})
