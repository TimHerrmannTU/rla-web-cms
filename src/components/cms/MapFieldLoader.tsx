'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the real MapField client component with SSR disabled
const MapField = dynamic(() => import('./MapField'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '400px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#18181b',
        color: '#71717a',
        borderRadius: '4px',
        border: '1px solid #27272a',
      }}
    >
      Loading Map Interface...
    </div>
  ),
})

// Default export wrapper
export default function MapFieldLoader(props: { path: string }) {
  return <MapField {...props} />
}
