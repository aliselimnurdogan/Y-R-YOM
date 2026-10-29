import { zoneOfProvince } from './provinces'
import type { PlaceItem } from './types'

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

function slug(value: string): string {
  return value
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function fetchOsmCamps(province: string): Promise<PlaceItem[]> {
  const query = `[out:json][timeout:25];
area["name"="${province}"]["admin_level"="4"]->.a;
(
  nwr["tourism"="camp_site"](area.a);
  nwr["tourism"="caravan_site"](area.a);
  nwr["tourism"="picnic_site"](area.a);
);
out center 160;`
  const body = `data=${encodeURIComponent(query)}`
  const attempts = ENDPOINTS.map(async (endpoint) => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 18000)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body,
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`overpass ${response.status}`)
      const data = (await response.json()) as { elements?: Array<Record<string, unknown>> }
      return (data.elements ?? [])
        .map((item) => toPlace(item, province))
        .filter((item): item is PlaceItem => item !== null)
    } finally {
      window.clearTimeout(timer)
    }
  })
  try {
    return await Promise.any(attempts)
  } catch {
    throw new Error('overpass')
  }
}

function toPlace(raw: Record<string, unknown>, province: string): PlaceItem | null {
  const tags = (raw.tags && typeof raw.tags === 'object' ? raw.tags : {}) as Record<string, string>
  const lat =
    typeof raw.lat === 'number'
      ? raw.lat
      : raw.center && typeof raw.center === 'object'
        ? Number((raw.center as { lat?: number }).lat)
        : NaN
  const lng =
    typeof raw.lon === 'number'
      ? raw.lon
      : raw.center && typeof raw.center === 'object'
        ? Number((raw.center as { lon?: number }).lon)
        : NaN
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  const osmId = String(raw.id ?? '')
  if (!osmId) return null
  const title = tags.name || tags['name:tr'] || `${province} OSM noktası`
  const ele = Number(tags.ele)
  const picnic = tags.tourism === 'picnic_site'
  return {
    id: `osm-${osmId}`,
    title,
    kind: picnic ? 'doga' : 'kamp',
    region: province,
    city: tags['addr:city'] || province,
    lat,
    lng,
    elevationM: Number.isFinite(ele) ? ele : 0,
    summary: picnic
      ? 'OpenStreetMap piknik kaydı. Resmi kamp izni değildir.'
      : 'OpenStreetMap kayıtlı kamp/karavan noktası. Resmi tahsis veya izin değildir; gitmeden idareyi veya muhtarlığı sorun.',
    images: [],
    videos: [],
    zone: zoneOfProvince(province),
    statusLabel:
      tags.tourism === 'caravan_site' ? 'OSM karavan' : picnic ? 'OSM piknik' : 'OSM kamp',
    feeTent: null,
  }
}

export function placeKey(place: { title: string; lat: number; lng: number; region?: string }): string {
  return `${slug(place.title)}-${slug(place.region || '')}-${place.lat.toFixed(2)}-${place.lng.toFixed(2)}`
}

export function mergePlaces(base: PlaceItem[], extra: PlaceItem[]): PlaceItem[] {
  const keys = new Set(base.map(placeKey))
  const ids = new Set(base.map((item) => item.id))
  const out = [...base]
  for (const item of extra) {
    const key = placeKey(item)
    if (keys.has(key) || ids.has(item.id)) continue
    keys.add(key)
    ids.add(item.id)
    out.push(item)
  }
  return out
}
