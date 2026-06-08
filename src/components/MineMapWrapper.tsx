'use client'
import dynamic from 'next/dynamic'

// Move the dynamic import here
const Map = dynamic(() => import('./MineMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 text-slate-400">Loading Map...</div>,
})

export default function MineMapWrapper({ mines }: { mines: any[] }) {
  return <Map mines={mines} />
}
