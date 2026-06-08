import { getPayload } from 'payload'
import config from '@/payload.config'
import MineMapWrapper from '@/components/MineMapWrapper'

export default async function HomePage() {
  const payload = await getPayload({ config })

  const mines = await payload.find({
    collection: 'mine',
    limit: 100,
  })

  return (
    <section className="h-full grid grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <MineMapWrapper mines={mines.docs} />
      </div>

      <div className="overflow-y-auto p-4 bg-slate-50 text-slate-900">
        <h2 className="font-bold mb-4">Sites ({mines.totalDocs})</h2>
        <div className="space-y-3">
          {mines.docs.map((mine) => (
            <div key={mine.id} className="p-3 bg-white rounded border shadow-sm">
              <h3 className="font-medium text-sm">{mine.title}</h3>
              <span className="text-[10px] px-2 py-1 rounded-full bg-slate-200 uppercase font-bold">
                {mine.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
