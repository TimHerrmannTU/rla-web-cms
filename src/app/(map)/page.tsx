import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function MapPage() {
  const payload = await getPayload({ config })

  const mines = await payload.find({
    collection: 'mine',
  })

  return (
    <main>
      <h1>Mines List</h1>
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
