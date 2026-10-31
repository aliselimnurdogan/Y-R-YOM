import { useEffect, useRef, useState, type ReactNode } from 'react'
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet'
import type { Layer, LeafletMouseEvent, PathOptions } from 'leaflet'
import { PROVINCE_COLLECTION } from '../admin-geo'
import { TURKEY_CENTER, TURKEY_ZOOM } from '../labels'
import { TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL } from '../tiles'
import { MapBrand } from './Brand'

function KeepTurkey() {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    map.setView(TURKEY_CENTER, TURKEY_ZOOM, { animate: false })
    const later = window.setTimeout(() => {
      map.invalidateSize()
      map.setView(TURKEY_CENTER, TURKEY_ZOOM, { animate: false })
    }, 320)
    return () => window.clearTimeout(later)
  }, [map])
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
  onSelectProvince,
  overlay,
}: {
  province: string | null
  onSelectProvince: (name: string | null) => void
  overlay?: ReactNode
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
    <div ref={wrapRef} className="land-map is-fixed" role="region" aria-label="Türkiye haritası">
      {sized && (
        <MapContainer
          center={TURKEY_CENTER}
          zoom={TURKEY_ZOOM}
          className="map-canvas"
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          dragging={false}
          zoomControl={false}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
          <KeepTurkey />
          <ProvincePaint province={province} onSelect={onSelectProvince} />
        </MapContainer>
      )}
      {overlay}
      {province && (
        <button type="button" className="map-reset" onClick={() => onSelectProvince(null)}>
          Tüm Türkiye
        </button>
      )}
      <MapBrand />
    </div>
  )
}
