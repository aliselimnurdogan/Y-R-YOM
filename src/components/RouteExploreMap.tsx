import { Fragment, useEffect, useMemo, useRef } from 'react'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { formatKm } from '../format'
import { ACTIVITY_COLORS } from '../labels'
import { TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL } from '../tiles'
import type { RouteItem } from '../types'
import { MapBrand } from './Brand'

function MapController({
  active,
  idsKey,
  tracks,
  mapRef,
}: {
  active: boolean
  idsKey: string
  tracks: [number, number][][]
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
      if (!idsKey || tracks.length === 0) return
      const points: [number, number][] = []
      for (const track of tracks) {
        for (const point of track) points.push(point)
      }
      if (points.length > 0) map.fitBounds(points, { padding: [40, 40], maxZoom: 16 })
    }, 50)
    return () => window.clearTimeout(handle)
  }, [active, idsKey, map, tracks])

  return null
}

export function RouteExploreMap({
  routes,
  shown,
  active,
}: {
  routes: RouteItem[]
  shown: RouteItem[]
  active: boolean
}) {
  const mapRef = useRef<ReturnType<typeof useMap> | null>(null)
  const tracks = useMemo(
    () => shown.map((route) => route.track.map((point) => [point[0], point[1]] as [number, number])),
    [shown],
  )
  const idsKey = shown.map((route) => route.id).join('|')

  return (
    <div className="map-wrap" role="region" aria-label="Türkiye haritası">
      <MapContainer
        center={[39.1, 35.2]}
        zoom={6}
        className="map-canvas"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
        <MapController active={active} idsKey={idsKey} tracks={tracks} mapRef={mapRef} />
        {shown.map((route) => {
          const color = ACTIVITY_COLORS[route.activity]
          const positions = route.track.map((point) => [point[0], point[1]] as [number, number])
          return (
            <Fragment key={route.id}>
              <Polyline
                positions={positions}
                pathOptions={{ color: '#ffffff', weight: 7, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
                interactive={false}
              />
              <Polyline
                positions={positions}
                pathOptions={{ color, weight: 4, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }}
                interactive={false}
              />
            </Fragment>
          )
        })}
        {routes.map((route) => {
          const start = route.track[0]
          if (!start) return null
          const color = ACTIVITY_COLORS[route.activity]
          return (
            <CircleMarker
              key={route.id}
              center={[start[0], start[1]]}
              radius={6}
              pathOptions={{ color: '#ffffff', weight: 2, fillColor: color, fillOpacity: 1, opacity: 1 }}
            >
              <Popup className="route-popup" maxWidth={240}>
                <div className="popup-title">{route.title}</div>
                <div className="popup-meta">{formatKm(route.distanceKm)} km</div>
                <Link className="popup-link" to={`/rota/${route.id}`}>
                  Rotayı aç
                </Link>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
      <button
        type="button"
        className="map-reset"
        onClick={() => mapRef.current?.setView([39.1, 35.2], 6)}
      >
        Türkiye
      </button>
      <MapBrand />
    </div>
  )
}
