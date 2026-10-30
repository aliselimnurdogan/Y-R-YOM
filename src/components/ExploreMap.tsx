import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import type { Layer, LeafletMouseEvent, PathOptions } from 'leaflet'
import { Link } from 'react-router-dom'
import { regionById, turkeyRegionCollection } from '../data/turkey-regions'
import { formatInt } from '../format'
import { PLACE_KIND_COLORS, PLACE_KIND_LABELS, type CatalogZone } from '../labels'
import { HAS_ATLAS, HAS_LIVE } from '../step'
import { MapBrand } from './Brand'
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
  zone,
  locked,
}: {
  active: boolean
  hoveredId: string | null
  places: PlaceItem[]
  mapRef: { current: ReturnType<typeof useMap> | null }
  center: [number, number]
  zoom: number
  onZoom: (value: number) => void
  zone: string | null
  locked: boolean
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
    if (!active || !locked) return
    const apply = () => {
      map.invalidateSize()
      const region = regionById(zone)
      if (region) map.flyToBounds(region.bounds, { padding: [36, 36], maxZoom: 8, duration: 0.85 })
      else map.setView(center, zoom, { animate: false })
    }
    apply()
    const later = window.setTimeout(apply, 280)
    return () => window.clearTimeout(later)
  }, [active, map, locked, zone, center, zoom])

  useEffect(() => {
    if (!active || locked) return
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
  }, [active, map, locked, places, center, zoom])

  useEffect(() => {
    if (locked || !hoveredId) return
    const place = places.find((item) => item.id === hoveredId)
    if (!place) return
    map.panTo([place.lat, place.lng])
  }, [hoveredId, locked, map, places])

  return null
}

function RegionLayer({
  zone,
  onSelectZone,
}: {
  zone: string | null
  onSelectZone: (zone: CatalogZone) => void
}) {
  const data = useMemo(() => turkeyRegionCollection(), [])

  function pathStyle(id: string): PathOptions {
    const selected = zone === id
    const dim = Boolean(zone && !selected)
    return {
      color: selected ? '#7f1d1d' : '#8a3b32',
      weight: selected ? 2.8 : 1.3,
      fillColor: selected ? '#c43121' : '#e2c2b4',
      fillOpacity: selected ? 0.58 : dim ? 0.1 : 0.32,
      opacity: dim ? 0.35 : 1,
    }
  }

  return (
    <GeoJSON
      key={zone || 'all'}
      data={data}
      style={(feature) => pathStyle(String(feature?.properties?.id || ''))}
      onEachFeature={(feature, layer: Layer) => {
        const id = String(feature.properties?.id || '') as CatalogZone
        layer.bindTooltip(id, {
          sticky: true,
          direction: 'center',
          className: 'zone-tip',
          opacity: 1,
        })
        layer.on({
          click: (event: LeafletMouseEvent) => {
            event.originalEvent.preventDefault()
            event.originalEvent.stopPropagation()
            onSelectZone(id)
          },
          mouseover: (event) => {
            if (zone === id) return
            event.target.setStyle({ fillColor: '#e24a3a', fillOpacity: 0.48, color: '#9f1f1f', weight: 2.2 })
            event.target.bringToFront()
          },
          mouseout: (event) => {
            event.target.setStyle(pathStyle(id))
          },
        })
      }}
    />
  )
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
  zone = null,
  onSelectZone,
}: {
  places: PlaceItem[]
  hoveredId: string | null
  active: boolean
  basePath: string
  center: [number, number]
  zoom: number
  resetLabel: string
  zone?: string | null
  onSelectZone?: (zone: CatalogZone | null) => void
}) {
  const mapRef = useRef<ReturnType<typeof useMap> | null>(null)
  const [basemap, setBasemap] = useState<BasemapId>('topo')
  const [zoomLevel, setZoomLevel] = useState(zoom)
  const locked = HAS_ATLAS
  const layer = HAS_LIVE ? BASEMAPS[basemap] : { url: TILE_URL, attribution: TILE_ATTRIBUTION }
  const clusters = useMemo(() => clusterPlaces(places, zoomLevel), [places, zoomLevel])

  return (
    <div className={locked ? 'map-wrap is-atlas' : 'map-wrap'} role="region" aria-label={`${resetLabel} haritası`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="map-canvas"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={!locked}
        doubleClickZoom={!locked}
        touchZoom={!locked}
        boxZoom={!locked}
        keyboard={!locked}
        dragging={!locked}
        zoomControl={!locked}
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
          zone={zone}
          locked={locked}
        />
        {locked && onSelectZone && <RegionLayer zone={zone} onSelectZone={onSelectZone} />}
        {(!locked || zone) &&
          clusters.map((cluster) => {
          if (cluster.items.length > 1) {
            return (
              <CircleMarker
                key={cluster.key}
                center={[cluster.lat, cluster.lng]}
                radius={12}
                pathOptions={{
                  color: '#ffffff',
                  weight: 2,
                  fillColor: locked ? '#c43121' : '#0ea5e9',
                  fillOpacity: 0.92,
                }}
                eventHandlers={{
                  click: () => {
                    if (locked) return
                    mapRef.current?.setView([cluster.lat, cluster.lng], Math.min(zoomLevel + 2, 12))
                  },
                }}
              >
                <Popup className="route-popup" maxWidth={240}>
                  <div className="popup-title">{cluster.items.length} nokta</div>
                  <div className="popup-meta">{locked ? 'Bölgeye tıkla, yanda listelenir' : 'Yakınlaşınca tek tek açılır'}</div>
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
                fillColor: selected ? '#c43121' : color,
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
      {HAS_LIVE && !locked && (
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
      <button
        type="button"
        className="map-reset"
        onClick={() => {
          if (locked && onSelectZone) onSelectZone(null)
          else mapRef.current?.setView(center, zoom)
        }}
      >
        {resetLabel}
      </button>
      {locked && (
        <p className="map-hint">{zone ? `${zone} seçili · kırmızı bölge` : 'Bölgeye tıkla, harita oraya gider'}</p>
      )}
      <MapBrand />
    </div>
  )
}
