import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function MapPage() {
  const payload = await getPayload({ config })

  const mines = await payload.find({
    collection: 'mine',
    limit: 100,
  })

  return (
    <main>
      <h1>Mines List</h1>
      <h2>Mines List</h2>
      <h3>Mines List</h3>
      <h4>Mines List</h4>
      <pre>
        {JSON.stringify(
          mines.docs.map((m) => m.title),
          null,
          2,
        )}
      </pre>
    </main>
  )
}
