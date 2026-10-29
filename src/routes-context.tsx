import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import bundledRoutes from './data/routes.json'
import { ACTIVITIES, DIFFICULTIES } from './labels'
import type { Activity, Difficulty, RouteItem, Waypoint } from './types'

type Status = 'loading' | 'error' | 'ready'

interface RoutesState {
  status: Status
  routes: RouteItem[]
  reload: () => void
}

const RoutesContext = createContext<RoutesState | null>(null)

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function parseTrack(raw: unknown): [number, number, number][] {
  if (!Array.isArray(raw)) return []
  const track: [number, number, number][] = []
  for (const point of raw) {
    if (!Array.isArray(point) || point.length < 3) continue
    const lat = finiteNumber(point[0])
    const lng = finiteNumber(point[1])
    const ele = finiteNumber(point[2])
    if (lat === null || lng === null || ele === null) continue
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue
    track.push([lat, lng, ele])
  }
  return track
}

function parseWaypoints(raw: unknown): Waypoint[] {
  if (!Array.isArray(raw)) return []
  const waypoints: Waypoint[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const lat = finiteNumber(record.lat)
    const lng = finiteNumber(record.lng)
    if (typeof record.name !== 'string' || lat === null || lng === null) continue
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue
    waypoints.push({ name: record.name, lat, lng })
  }
  return waypoints
}

function normalizeRoute(raw: unknown): RouteItem | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>
  if (typeof record.id !== 'string' || record.id.length === 0) return null
  if (typeof record.title !== 'string') return null
  if (typeof record.activity !== 'string' || !ACTIVITIES.includes(record.activity as Activity)) return null
  if (typeof record.region !== 'string' || typeof record.city !== 'string') return null
  if (typeof record.difficulty !== 'string' || !DIFFICULTIES.includes(record.difficulty as Difficulty)) return null
  if (typeof record.loop !== 'boolean') return null
  const distanceKm = finiteNumber(record.distanceKm)
  const elevationGainM = finiteNumber(record.elevationGainM)
  const elevationLossM = finiteNumber(record.elevationLossM)
  const maxElevationM = finiteNumber(record.maxElevationM)
  const minElevationM = finiteNumber(record.minElevationM)
  const durationMin = finiteNumber(record.durationMin)
  const rating = finiteNumber(record.rating)
  const ratingCount = finiteNumber(record.ratingCount)
  if (
    distanceKm === null ||
    elevationGainM === null ||
    elevationLossM === null ||
    maxElevationM === null ||
    minElevationM === null ||
    durationMin === null ||
    rating === null ||
    ratingCount === null
  ) {
    return null
  }
  if (typeof record.author !== 'string' || typeof record.recordedAt !== 'string') return null
  if (typeof record.description !== 'string' || typeof record.image !== 'string') return null
  return {
    id: record.id,
    title: record.title,
    activity: record.activity as Activity,
    region: record.region,
    city: record.city,
    difficulty: record.difficulty as Difficulty,
    loop: record.loop,
    distanceKm,
    elevationGainM,
    elevationLossM,
    maxElevationM,
    minElevationM,
    durationMin,
    rating,
    ratingCount,
    author: record.author,
    recordedAt: record.recordedAt,
    description: record.description,
    image: record.image,
    track: parseTrack(record.track),
    waypoints: parseWaypoints(record.waypoints),
  }
}

export function RoutesProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  const [routes, setRoutes] = useState<RouteItem[]>([])

  useEffect(() => {
    setStatus('loading')
    try {
      if (!Array.isArray(bundledRoutes) || bundledRoutes.length === 0) throw new Error('empty')
      const parsed = bundledRoutes
        .map(normalizeRoute)
        .filter((route): route is RouteItem => route !== null)
      if (parsed.length === 0) throw new Error('empty')
      setRoutes(parsed)
      setStatus('ready')
    } catch {
      setRoutes([])
      setStatus('error')
    }
  }, [tick])

  const reload = () => setTick((value) => value + 1)

  return <RoutesContext.Provider value={{ status, routes, reload }}>{children}</RoutesContext.Provider>
}

export function useRoutes(): RoutesState {
  const context = useContext(RoutesContext)
  if (!context) throw new Error('Rota verisi hazır değil')
  return context
}
