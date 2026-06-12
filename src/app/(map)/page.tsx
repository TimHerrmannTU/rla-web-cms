import { getPayload } from 'payload'
import config from '@/payload.config'

import MapLoader from '@/components/map/MapLoader'
import RickRoll from '@/components/map/RickRoll'

export default async function MapPage() {
  const payload = await getPayload({ config })

  const mines = await payload.find({
    collection: 'mine',
    limit: 100,
  })

  return (
    <main className="h-screen w-screen">
      <MapLoader center={[51, 10]} zoom={5} />
      <RickRoll />
    </main>
  )
}
