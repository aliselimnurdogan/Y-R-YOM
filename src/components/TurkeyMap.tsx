import { useEffect, useRef, useState } from 'react'
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import type { Layer, LeafletMouseEvent, PathOptions } from 'leaflet'
import { Link } from 'react-router-dom'
import { PROVINCE_COLLECTION, provinceBounds } from '../admin-geo'
import { formatInt } from '../format'
import { PLACE_KIND_COLORS, PLACE_KIND_LABELS, TURKEY_CENTER, TURKEY_ZOOM } from '../labels'
import { TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL } from '../tiles'
import type { PlaceItem } from '../types'
import { MapBrand } from './Brand'

function FlyTo({ province }: { province: string | null }) {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    const box = province ? provinceBounds(province) : null
    if (box) {
      map.flyToBounds(box, { padding: [28, 28], maxZoom: 9, duration: 0.9 })
    } else {
      map.setView(TURKEY_CENTER, TURKEY_ZOOM)
    }
    const later = window.setTimeout(() => map.invalidateSize(), 320)
    return () => window.clearTimeout(later)
  }, [map, province])
  return null
}

function ProvincePaint({
  province,
  onSelect,
}: {
  province: string | null
  onSelect: (name: string) => void
}) {
  function pathStyle(name: string): PathOptions {
    const hot = province === name
    return {
      stroke: true,
      color: hot ? '#9f1f1f' : '#24382e',
      weight: hot ? 2.8 : 1,
      fillColor: hot ? '#c43121' : '#24382e',
      fillOpacity: hot ? 0.38 : 0.05,
      opacity: hot ? 1 : 0.65,
      fill: true,
    }
  }

  return (
    <GeoJSON
      key={province || 'tr'}
      data={PROVINCE_COLLECTION}
      style={(feature) => pathStyle(String(feature?.properties?.name || ''))}
      onEachFeature={(feature, layer: Layer) => {
        const name = String(feature.properties?.name || '')
        if (!name) return
        layer.bindTooltip(name, {
          sticky: true,
          direction: 'center',
          className: 'zone-tip',
          opacity: 1,
        })
        layer.on({
          click: (event: LeafletMouseEvent) => {
            event.originalEvent.preventDefault()
            event.originalEvent.stopPropagation()
            onSelect(name)
          },
        })
      }}
    />
  )
}

export function TurkeyMap({
  province,
  places,
  onSelectProvince,
}: {
  province: string | null
  places: PlaceItem[]
  onSelectProvince: (name: string | null) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState({ w: 0, h: 0 })
  const sized = frame.w >= 180 && frame.h >= 180

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return
    const check = () => setFrame({ w: node.clientWidth, h: node.clientHeight })
    check()
    const observer = new ResizeObserver(check)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="land-map" role="region" aria-label="Türkiye haritası">
      {sized && (
        <MapContainer
          center={TURKEY_CENTER}
          zoom={TURKEY_ZOOM}
          className="map-canvas"
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
          doubleClickZoom
          touchZoom
          boxZoom
          keyboard
          dragging
          zoomControl
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
          <FlyTo province={province} />
          <ProvincePaint province={province} onSelect={onSelectProvince} />
          {places.map((place) => {
            const color = PLACE_KIND_COLORS[place.kind]
            return (
              <CircleMarker
                key={place.id}
                center={[place.lat, place.lng]}
                radius={7}
                pathOptions={{ color: '#ffffff', weight: 2, fillColor: color, fillOpacity: 1 }}
              >
                <Popup className="route-popup" maxWidth={240}>
                  <div className="popup-title">{place.title}</div>
                  <div className="popup-meta">
                    {place.statusLabel ?? PLACE_KIND_LABELS[place.kind]} · {place.city}
                    {place.elevationM ? ` · ${formatInt(place.elevationM)} m` : ''}
                  </div>
                  <Link className="popup-link" to={`/kamp/${place.id}`}>
                    Yeri aç
                  </Link>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      )}
      {province && (
        <button type="button" className="map-reset" onClick={() => onSelectProvince(null)}>
          Tüm Türkiye
        </button>
      )}
      <MapBrand />
    </div>
  )
}
