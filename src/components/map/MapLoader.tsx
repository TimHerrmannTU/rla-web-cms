'use client'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./BaseMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">Loading Map Engine...</div>
  ),
})

export default Map
