'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for Leaflet icons
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function FrontendMap({ mines }: { mines: any[] }) {
  return (
    <div className="h-full w-full">
      <MapContainer center={[50, 15]} zoom={4} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {mines.map((mine) => (
          <Marker key={mine.id} position={[mine.location[1], mine.location[0]]} icon={icon}>
            <Popup>
              <div className="h-fit grid grid-cols-[1fr auto] grid-rows-2 gap-x-3">
                <div className="col-1 row-span-2">{/* insert icon here */}</div>
                <h3 className="col-2 font-bold">{mine.title}</h3>
                <div className="col-2 text-sm">Somewhere in bumfuck nowhere</div>
              </div>
              <div className="font-sans mt-2 flex flex-col gap-1">
                <div>
                  <strong>Status: </strong>
                  {mine.status}
                </div>
                <div>
                  <strong>Type: </strong>
                  {mine.siteType}
                </div>
                <div>
                  <strong>Product: </strong>
                  {mine.extractedMaterials}
                </div>
                <div>
                  <strong>Total Size: </strong>
                  {mine.surface.total} ha
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
