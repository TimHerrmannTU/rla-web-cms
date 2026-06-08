'use client'
import dynamic from 'next/dynamic'

// Move the dynamic import here
const Map = dynamic(() => import('./MineMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">
      Loading Map...
    </div>
  ),
})

export default function MineMapWrapper({ mines }: { mines: any[] }) {
  return <Map mines={mines} />
}
