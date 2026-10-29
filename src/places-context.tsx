import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import bundledCamps from './data/camps.json'
import bundledPlaces from './data/places.json'
import { ALL_PLACE_KINDS } from './labels'
import { APP_STEP } from './step'
import type { PlaceItem, PlaceKind, PlaceVideo } from './types'

type Status = 'loading' | 'error' | 'ready'

interface PlacesState {
  status: Status
  places: PlaceItem[]
  reload: () => void
}

const PlacesContext = createContext<PlacesState | null>(null)

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function parseVideos(raw: unknown): PlaceVideo[] {
  if (!Array.isArray(raw)) return []
  const videos: PlaceVideo[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    if (typeof record.youtubeId !== 'string' || record.youtubeId.length !== 11) continue
    if (typeof record.title !== 'string') continue
    videos.push({ youtubeId: record.youtubeId, title: record.title })
  }
  return videos
}

function parseImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is string => typeof item === 'string' && item.startsWith('https://'))
}

function normalizePlace(raw: unknown): PlaceItem | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>
  if (typeof record.id !== 'string' || record.id.length === 0) return null
  if (typeof record.title !== 'string' || typeof record.city !== 'string') return null
  if (typeof record.kind !== 'string' || !ALL_PLACE_KINDS.includes(record.kind as PlaceKind)) return null
  const lat = finiteNumber(record.lat)
  const lng = finiteNumber(record.lng)
  const elevationM = finiteNumber(record.elevationM)
  if (lat === null || lng === null || elevationM === null) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  if (typeof record.summary !== 'string') return null
  const images = parseImages(record.images)
  if (images.length === 0) return null
  return {
    id: record.id,
    title: record.title,
    kind: record.kind as PlaceKind,
    region: typeof record.region === 'string' && record.region.length > 0 ? record.region : 'Kahramanmaraş',
    city: record.city,
    lat,
    lng,
    elevationM,
    summary: record.summary,
    images,
    videos: parseVideos(record.videos),
  }
}

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  const [places, setPlaces] = useState<PlaceItem[]>([])

  useEffect(() => {
    setStatus('loading')
    try {
      const bundled = APP_STEP === '1' ? bundledCamps : bundledPlaces
      if (!Array.isArray(bundled) || bundled.length === 0) throw new Error('empty')
      const parsed = bundled.map(normalizePlace).filter((place): place is PlaceItem => place !== null)
      if (parsed.length === 0) throw new Error('empty')
      setPlaces(parsed)
      setStatus('ready')
    } catch {
      setPlaces([])
      setStatus('error')
    }
  }, [tick])

  const reload = () => setTick((value) => value + 1)

  return <PlacesContext.Provider value={{ status, places, reload }}>{children}</PlacesContext.Provider>
}

export function usePlaces(): PlacesState {
  const context = useContext(PlacesContext)
  if (!context) throw new Error('Yer verisi hazır değil')
  return context
}
