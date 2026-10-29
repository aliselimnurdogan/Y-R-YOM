import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { MARAS_CENTER, MARAS_ZOOM, PLACE_KIND_COLORS } from '../labels'
import { HAS_LIVE } from '../step'
import { BASEMAPS, TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL, type BasemapId } from '../tiles'
import type { PlaceItem } from '../types'

function DetailController({ place }: { place: PlaceItem }) {
  const map = useMap()

  useEffect(() => {
    map.attributionControl.setPrefix('')
  }, [map])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      map.invalidateSize()
      map.setView([place.lat, place.lng], 12)
    }, 40)
    return () => window.clearTimeout(handle)
  }, [map, place.id, place.lat, place.lng])

  return null
}

export function DetailMap({ place }: { place: PlaceItem }) {
  const color = PLACE_KIND_COLORS[place.kind]
  const [basemap, setBasemap] = useState<BasemapId>('topo')
  const layer = HAS_LIVE ? BASEMAPS[basemap] : { url: TILE_URL, attribution: TILE_ATTRIBUTION }

  return (
    <div className="detail-map" role="region" aria-label="Yer haritası">
      <MapContainer
        center={MARAS_CENTER}
        zoom={MARAS_ZOOM}
        className="map-canvas"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer key={layer.url} url={layer.url} attribution={layer.attribution} maxZoom={TILE_MAX_ZOOM} />
        <DetailController place={place} />
        <CircleMarker
          center={[place.lat, place.lng]}
          radius={9}
          pathOptions={{ color: '#ffffff', weight: 2, fillColor: color, fillOpacity: 1 }}
        >
          <Popup className="route-popup">
            <div className="popup-title">{place.title}</div>
          </Popup>
        </CircleMarker>
      </MapContainer>
      {HAS_LIVE && (
        <div className="basemap-switch on-detail" role="group" aria-label="Harita katmanı">
          {(Object.keys(BASEMAPS) as BasemapId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={basemap === id ? 'is-on' : undefined}
              onClick={() => setBasemap(id)}
            >
              {BASEMAPS[id].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
