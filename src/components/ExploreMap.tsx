import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { formatInt } from '../format'
import { PLACE_KIND_COLORS, PLACE_KIND_LABELS } from '../labels'
import { HAS_LIVE } from '../step'
import { BASEMAPS, TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL, type BasemapId } from '../tiles'
import type { PlaceItem } from '../types'

function MapController({
  active,
  hoveredId,
  places,
  mapRef,
  center,
  zoom,
  onZoom,
}: {
  active: boolean
  hoveredId: string | null
  places: PlaceItem[]
  mapRef: { current: ReturnType<typeof useMap> | null }
  center: [number, number]
  zoom: number
  onZoom: (value: number) => void
}) {
  const map = useMap()

  useEffect(() => {
    mapRef.current = map
    map.attributionControl.setPrefix('')
  }, [map, mapRef])

  useEffect(() => {
    const update = () => onZoom(map.getZoom())
    update()
    map.on('zoomend', update)
    return () => {
      map.off('zoomend', update)
    }
  }, [map, onZoom])

  useEffect(() => {
    if (!active) return
    const handle = window.setTimeout(() => {
      map.invalidateSize()
      if (places.length === 0) {
        map.setView(center, zoom)
        return
      }
      map.fitBounds(
        places.map((place) => [place.lat, place.lng] as [number, number]),
        { padding: [40, 40], maxZoom: zoom >= 8 ? 11 : 8 },
      )
    }, 50)
    return () => window.clearTimeout(handle)
  }, [active, map, places, center, zoom])

  useEffect(() => {
    if (!hoveredId) return
    const place = places.find((item) => item.id === hoveredId)
    if (!place) return
    map.panTo([place.lat, place.lng])
  }, [hoveredId, map, places])

  return null
}

function clusterPlaces(places: PlaceItem[], zoom: number) {
  if (!HAS_LIVE || zoom >= 8 || places.length < 50) {
    return places.map((place) => ({ key: place.id, lat: place.lat, lng: place.lng, items: [place] }))
  }
  const cell = zoom >= 6 ? 0.7 : 1.4
  const buckets = new Map<string, PlaceItem[]>()
  for (const place of places) {
    const key = `${Math.round(place.lat / cell)}_${Math.round(place.lng / cell)}`
    const list = buckets.get(key) ?? []
    list.push(place)
    buckets.set(key, list)
  }
  return [...buckets.entries()].map(([key, items]) => ({
    key,
    lat: items.reduce((sum, item) => sum + item.lat, 0) / items.length,
    lng: items.reduce((sum, item) => sum + item.lng, 0) / items.length,
    items,
  }))
}

export function ExploreMap({
  places,
  hoveredId,
  active,
  basePath,
  center,
  zoom,
  resetLabel,
}: {
  places: PlaceItem[]
  hoveredId: string | null
  active: boolean
  basePath: string
  center: [number, number]
  zoom: number
  resetLabel: string
}) {
  const mapRef = useRef<ReturnType<typeof useMap> | null>(null)
  const [basemap, setBasemap] = useState<BasemapId>('topo')
  const [zoomLevel, setZoomLevel] = useState(zoom)
  const layer = HAS_LIVE ? BASEMAPS[basemap] : { url: TILE_URL, attribution: TILE_ATTRIBUTION }
  const clusters = useMemo(() => clusterPlaces(places, zoomLevel), [places, zoomLevel])

  return (
    <div className="map-wrap" role="region" aria-label={`${resetLabel} haritası`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="map-canvas"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer key={layer.url} url={layer.url} attribution={layer.attribution} maxZoom={TILE_MAX_ZOOM} />
        <MapController
          active={active}
          hoveredId={hoveredId}
          places={places}
          mapRef={mapRef}
          center={center}
          zoom={zoom}
          onZoom={setZoomLevel}
        />
        {clusters.map((cluster) => {
          if (cluster.items.length > 1) {
            return (
              <CircleMarker
                key={cluster.key}
                center={[cluster.lat, cluster.lng]}
                radius={12}
                pathOptions={{
                  color: '#ffffff',
                  weight: 2,
                  fillColor: '#0ea5e9',
                  fillOpacity: 0.92,
                }}
                eventHandlers={{
                  click: () => mapRef.current?.setView([cluster.lat, cluster.lng], Math.min(zoomLevel + 2, 12)),
                }}
              >
                <Popup className="route-popup" maxWidth={240}>
                  <div className="popup-title">{cluster.items.length} nokta</div>
                  <div className="popup-meta">Yakınlaşınca tek tek açılır</div>
                </Popup>
              </CircleMarker>
            )
          }
          const place = cluster.items[0]
          const color = PLACE_KIND_COLORS[place.kind]
          const selected = hoveredId === place.id
          return (
            <CircleMarker
              key={place.id}
              center={[place.lat, place.lng]}
              radius={selected ? 10 : place.pano ? 9 : 7}
              pathOptions={{
                color: place.pano ? '#14b8a6' : '#ffffff',
                weight: place.pano ? 3 : 2,
                fillColor: color,
                fillOpacity: 1,
                opacity: 1,
              }}
            >
              <Popup className="route-popup" maxWidth={240}>
                <div className="popup-title">{place.title}</div>
                <div className="popup-meta">
                  {PLACE_KIND_LABELS[place.kind]} · {place.city} · {formatInt(place.elevationM)} m
                  {place.pano ? ' · 360°' : ''}
                </div>
                <Link className="popup-link" to={`${basePath}/${place.id}`}>
                  Yeri aç
                </Link>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
      {HAS_LIVE && (
        <div className="basemap-switch" role="group" aria-label="Harita katmanı">
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
      <button type="button" className="map-reset" onClick={() => mapRef.current?.setView(center, zoom)}>
        {resetLabel}
      </button>
    </div>
  )
}
