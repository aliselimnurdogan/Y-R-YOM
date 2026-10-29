import { useEffect, useRef } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { formatInt } from '../format'
import { MARAS_CENTER, MARAS_ZOOM, PLACE_KIND_COLORS, PLACE_KIND_LABELS } from '../labels'
import { TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL } from '../tiles'
import type { PlaceItem } from '../types'

function MapController({
  active,
  hoveredId,
  places,
  mapRef,
}: {
  active: boolean
  hoveredId: string | null
  places: PlaceItem[]
  mapRef: { current: ReturnType<typeof useMap> | null }
}) {
  const map = useMap()

  useEffect(() => {
    mapRef.current = map
    map.attributionControl.setPrefix('')
  }, [map, mapRef])

  useEffect(() => {
    if (!active) return
    const handle = window.setTimeout(() => {
      map.invalidateSize()
      if (places.length === 0) {
        map.setView(MARAS_CENTER, MARAS_ZOOM)
        return
      }
      map.fitBounds(
        places.map((place) => [place.lat, place.lng] as [number, number]),
        { padding: [40, 40], maxZoom: 11 },
      )
    }, 50)
    return () => window.clearTimeout(handle)
  }, [active, map, places])

  useEffect(() => {
    if (!hoveredId) return
    const place = places.find((item) => item.id === hoveredId)
    if (!place) return
    map.panTo([place.lat, place.lng])
  }, [hoveredId, map, places])

  return null
}

export function ExploreMap({
  places,
  hoveredId,
  active,
}: {
  places: PlaceItem[]
  hoveredId: string | null
  active: boolean
}) {
  const mapRef = useRef<ReturnType<typeof useMap> | null>(null)

  return (
    <div className="map-wrap" role="region" aria-label="Kahramanmaraş haritası">
      <MapContainer
        center={MARAS_CENTER}
        zoom={MARAS_ZOOM}
        className="map-canvas"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
        <MapController active={active} hoveredId={hoveredId} places={places} mapRef={mapRef} />
        {places.map((place) => {
          const color = PLACE_KIND_COLORS[place.kind]
          const selected = hoveredId === place.id
          return (
            <CircleMarker
              key={place.id}
              center={[place.lat, place.lng]}
              radius={selected ? 10 : 7}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: color,
                fillOpacity: 1,
                opacity: 1,
              }}
            >
              <Popup className="route-popup" maxWidth={240}>
                <div className="popup-title">{place.title}</div>
                <div className="popup-meta">
                  {PLACE_KIND_LABELS[place.kind]} · {place.city} · {formatInt(place.elevationM)} m
                </div>
                <Link className="popup-link" to={`/yer/${place.id}`}>
                  Yeri aç
                </Link>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
      <button type="button" className="map-reset" onClick={() => mapRef.current?.setView(MARAS_CENTER, MARAS_ZOOM)}>
        Kahramanmaraş
      </button>
    </div>
  )
}
