import { useEffect } from 'react'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { pointsClose } from '../geo'
import { ACTIVITY_COLORS } from '../labels'
import { TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL } from '../tiles'
import type { RouteItem } from '../types'

export interface WaypointFocus {
  lat: number
  lng: number
  i: number
  n: number
}

function DetailController({
  route,
  waypoint,
}: {
  route: RouteItem
  waypoint: WaypointFocus | null
}) {
  const map = useMap()

  useEffect(() => {
    map.attributionControl.setPrefix('')
  }, [map])

  useEffect(() => {
    const track = route.track
    const handle = window.setTimeout(() => {
      map.invalidateSize()
      if (track.length === 0) return
      if (track.length === 1) {
        map.setView([track[0][0], track[0][1]], 14)
        return
      }
      map.fitBounds(
        track.map((point) => [point[0], point[1]] as [number, number]),
        { padding: [40, 40], maxZoom: 16 },
      )
    }, 40)
    return () => window.clearTimeout(handle)
  }, [map, route.id, route.track])

  useEffect(() => {
    if (!waypoint) return
    map.panTo([waypoint.lat, waypoint.lng])
  }, [map, waypoint])

  return null
}

export function DetailMap({
  route,
  hoverIndex,
  waypoint,
}: {
  route: RouteItem
  hoverIndex: number | null
  waypoint: WaypointFocus | null
}) {
  const color = ACTIVITY_COLORS[route.activity]
  const positions = route.track.map((point) => [point[0], point[1]] as [number, number])
  const start = route.track[0]
  const end = route.track[route.track.length - 1]
  const showEnd = Boolean(start && end && route.track.length > 1 && !pointsClose(start, end))
  const hover = hoverIndex !== null ? route.track[hoverIndex] : undefined

  return (
    <div className="detail-map" role="region" aria-label="Rota haritası">
      <MapContainer
        center={[39.1, 35.2]}
        zoom={6}
        className="map-canvas"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
        <DetailController route={route} waypoint={waypoint} />
        {positions.length > 1 && (
          <>
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
          </>
        )}
        {route.waypoints.map((point, index) => (
          <CircleMarker
            key={`${point.name}-${index}`}
            center={[point.lat, point.lng]}
            radius={waypoint?.i === index ? 7 : 4}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: waypoint?.i === index ? '#e65100' : '#6db33f',
              fillOpacity: 1,
            }}
          >
            <Popup className="route-popup">
              <div className="popup-title">{point.name}</div>
            </Popup>
          </CircleMarker>
        ))}
        {start && (
          <CircleMarker
            center={[start[0], start[1]]}
            radius={7}
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: color, fillOpacity: 1 }}
          />
        )}
        {showEnd && end && (
          <CircleMarker
            center={[end[0], end[1]]}
            radius={6}
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#202020', fillOpacity: 1 }}
          />
        )}
        {hover && (
          <CircleMarker
            center={[hover[0], hover[1]]}
            radius={8}
            pathOptions={{ color, weight: 3, fillColor: '#ffffff', fillOpacity: 1 }}
          />
        )}
      </MapContainer>
    </div>
  )
}
