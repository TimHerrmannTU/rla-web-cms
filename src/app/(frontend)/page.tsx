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
    <main className="max-w-6xl mx-auto p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Minescapes</h1>
        <p className="text-slate-500">Tracking the renaturation of industrial landscapes.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MineMapWrapper mines={mines.docs} />
        </div>

        <div className="h-[500px] overflow-y-auto border rounded-xl p-4 bg-slate-50">
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
    </main>
  )
}
