'use client'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface BaseMapProps {
  center: [number, number]
  zoom: number
  children?: React.ReactNode
}

export default function BaseMap({ center, zoom, children }: BaseMapProps) {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {children}
      </MapContainer>
    </div>
  )
}
