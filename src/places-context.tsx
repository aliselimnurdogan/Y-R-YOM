import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import bundledCamps from './data/camps.json'
import bundledCatalog from './data/catalog.json'
import bundledGezi from './data/gezi-yerler.json'
import bundledPlaces from './data/places.json'
import { seedDiscoverPlaces } from './data/seed-discover'
import { highlightPlaces } from './highlights'
import { ALL_PLACE_KINDS } from './labels'
import { mergePlaces } from './overpass'
import { ALLOWED_YOUTUBE, isAllowedMedia } from './media'
import { APP_STEP, HAS_CATALOG, HAS_GEZI, HAS_LIVE, HAS_POLISH, HAS_TOUR } from './step'
import type {
  CampGuide,
  FacilityFlag,
  FireFlag,
  FirewoodFlag,
  PanoKind,
  PlaceItem,
  PlaceKind,
  PlacePano,
  PlaceVideo,
  ShopFlag,
} from './types'

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
    if (typeof record.title !== 'string') continue
    let youtubeId =
      typeof record.youtubeId === 'string' && record.youtubeId.length === 11 ? record.youtubeId : undefined
    let src =
      typeof record.src === 'string' &&
      record.src.startsWith('https://') &&
      /\.(webm|mp4)(\?|$)/i.test(record.src)
        ? record.src
        : undefined
    if (HAS_POLISH) {
      if (youtubeId && !ALLOWED_YOUTUBE.has(youtubeId)) youtubeId = undefined
      if (src && !isAllowedMedia(src)) src = undefined
    }
    if (!youtubeId && !src) continue
    videos.push({ title: record.title, youtubeId, src })
  }
  return videos
}

function parseImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is string => {
    if (typeof item !== 'string' || !item.startsWith('https://')) return false
    if (HAS_POLISH) return isAllowedMedia(item)
    if (HAS_LIVE && item.includes('unsplash.com')) return false
    return true
  })
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
  if (images.length === 0 && !HAS_CATALOG) return null
  const areaHa = finiteNumber(record.areaHa)
  const feeRaw = record.feeTent
  const feeTent = feeRaw === null ? null : finiteNumber(feeRaw)
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
    zone: typeof record.zone === 'string' ? record.zone : undefined,
    areaHa: areaHa ?? undefined,
    feeTent: feeTent === null && feeRaw !== null ? undefined : feeTent,
    statusLabel: typeof record.statusLabel === 'string' ? record.statusLabel : undefined,
    district: typeof record.district === 'string' ? record.district : typeof record.city === 'string' ? record.city : undefined,
    intent:
      record.intent === 'tarih' ||
      record.intent === 'piknik' ||
      record.intent === 'yayla' ||
      record.intent === 'su' ||
      record.intent === 'gol'
        ? record.intent
        : undefined,
    guide: parseGuide(record.guide),
    pano: parsePano(record.pano),
  }
}

function parsePano(raw: unknown): PlacePano | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const record = raw as Record<string, unknown>
  if (typeof record.url !== 'string' || !record.url.startsWith('https://')) return undefined
  if (HAS_POLISH && !isAllowedMedia(record.url)) return undefined
  if (record.kind !== '360' && record.kind !== 'pano' && record.kind !== 'view') return undefined
  const width = finiteNumber(record.width)
  const height = finiteNumber(record.height)
  return {
    url: record.url,
    preview:
      typeof record.preview === 'string' &&
      record.preview.startsWith('https://') &&
      (!HAS_POLISH || isAllowedMedia(record.preview))
        ? record.preview
        : undefined,
    credit: typeof record.credit === 'string' && record.credit.length > 0 ? record.credit : 'Wikimedia Commons',
    kind: record.kind as PanoKind,
    width: width ?? undefined,
    height: height ?? undefined,
  }
}

const FLAGS = ['var', 'yok', 'belirsiz'] as const
const WOOD = ['getir', 'yerinde', 'yasak', 'belirsiz'] as const
const FIRE = ['yasak', 'ocak', 'belirsiz'] as const
const SHOP = ['var', 'yok', 'yakin', 'belirsiz'] as const

function asFlag<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : null
}

function stringList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function parseGuide(raw: unknown): CampGuide | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const record = raw as Record<string, unknown>
  const toilet = asFlag<FacilityFlag>(record.toilet, FLAGS)
  const power = asFlag<FacilityFlag>(record.power, FLAGS)
  const water = asFlag<FacilityFlag>(record.water, FLAGS)
  const firewood = asFlag<FirewoodFlag>(record.firewood, WOOD)
  const fire = asFlag<FireFlag>(record.fire, FIRE)
  const shop = asFlag<ShopFlag>(record.shop, SHOP)
  if (!toilet || !power || !water || !firewood || !fire || !shop) return undefined
  if (typeof record.difficulty !== 'string' || typeof record.advice !== 'string') return undefined
  return {
    toilet,
    power,
    water,
    firewood,
    fire,
    shop,
    difficulty: record.difficulty,
    pros: stringList(record.pros),
    cons: stringList(record.cons),
    tips: stringList(record.tips),
    advice: record.advice,
  }
}

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  const [places, setPlaces] = useState<PlaceItem[]>([])

  useEffect(() => {
    setStatus('loading')
    try {
      const bundled = HAS_CATALOG ? bundledCatalog : APP_STEP === '1' ? bundledCamps : bundledPlaces
      if (!Array.isArray(bundled) || bundled.length === 0) throw new Error('empty')
      let parsed = bundled.map(normalizePlace).filter((place): place is PlaceItem => place !== null)
      if (HAS_LIVE) {
        const maras = bundledPlaces.map(normalizePlace).filter((place): place is PlaceItem => place !== null)
        parsed = mergePlaces(parsed, [...highlightPlaces(), ...maras])
      }
      if (HAS_TOUR) {
        parsed = mergePlaces(parsed, seedDiscoverPlaces())
      }
      if (HAS_GEZI) {
        const gezi = bundledGezi.map(normalizePlace).filter((place): place is PlaceItem => place !== null)
        parsed = mergePlaces(parsed, gezi)
      }
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
