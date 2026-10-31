import { foldTr, trIncludes } from './format'
import { PROVINCES, zoneOfProvince } from './provinces'
import rawDistricts from './data/districts.json'
import rawProvinces from './data/tr-provinces.geo.json'

export interface DistrictRow {
  province: string
  district: string
  lat: number
  lng: number
}

export interface GeoSuggestion {
  id: string
  kind: 'province' | 'district'
  province: string
  district?: string
  label: string
  sub: string
  lat: number
  lng: number
}

export interface GeoFocus {
  province: string
  district?: string
}

type DistrictRaw = { p: string; d: string; lat: number; lng: number }
type ProvinceProps = { id: string; name: string; plate: number }
type Geometry = { type: string; coordinates: unknown }
type FeatureCollection = {
  type: 'FeatureCollection'
  features: Array<{ type: 'Feature'; properties: ProvinceProps; geometry: Geometry }>
}

const ALIAS: Record<string, string> = {
  afyon: 'Afyonkarahisar',
  afyonkarahisar: 'Afyonkarahisar',
  maras: 'Kahramanmaraş',
  kahramanmaras: 'Kahramanmaraş',
  antep: 'Gaziantep',
  gaziantep: 'Gaziantep',
  urfa: 'Şanlıurfa',
  sanliurfa: 'Şanlıurfa',
  icel: 'Mersin',
  mersin: 'Mersin',
  konstantiniye: 'İstanbul',
}

export const DISTRICT_ROWS: DistrictRow[] = (rawDistricts as DistrictRaw[]).map((row) => ({
  province: row.p,
  district: row.d,
  lat: row.lat,
  lng: row.lng,
}))

export const PROVINCE_COLLECTION = rawProvinces as FeatureCollection

const CENTROID = new Map<string, [number, number]>()
const BOUNDS = new Map<string, [[number, number], [number, number]]>()

function walk(coords: unknown, visit: (lng: number, lat: number) => void) {
  if (!Array.isArray(coords) || coords.length === 0) return
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    visit(coords[0], coords[1])
    return
  }
  for (const item of coords) walk(item, visit)
}

for (const feature of PROVINCE_COLLECTION.features) {
  const name = feature.properties?.name
  if (!name || !feature.geometry) continue
  let minLat = 90
  let minLng = 180
  let maxLat = -90
  let maxLng = -180
  let sumLat = 0
  let sumLng = 0
  let count = 0
  walk(feature.geometry.coordinates, (lng, lat) => {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    sumLat += lat
    sumLng += lng
    count += 1
  })
  if (count === 0) continue
  CENTROID.set(name, [sumLat / count, sumLng / count])
  BOUNDS.set(name, [
    [minLat, minLng],
    [maxLat, maxLng],
  ])
}

export function canonicalProvince(value: string): string | null {
  const folded = foldTr(value.trim())
  if (!folded) return null
  const aliased = ALIAS[folded]
  if (aliased) return aliased
  const hit = PROVINCES.find((item) => foldTr(item.name) === folded)
  return hit?.name ?? null
}

export function provinceCenter(name: string): [number, number] | null {
  return CENTROID.get(name) ?? null
}

export function provinceBounds(name: string): [[number, number], [number, number]] | null {
  return BOUNDS.get(name) ?? null
}

export function findDistrict(province: string, district: string): DistrictRow | undefined {
  const p = foldTr(province)
  const d = foldTr(district)
  return DISTRICT_ROWS.find((row) => foldTr(row.province) === p && foldTr(row.district) === d)
}

export function districtsOf(province: string): DistrictRow[] {
  return DISTRICT_ROWS.filter((row) => row.province === province)
}

export function suggestAdmin(query: string, limit = 8): GeoSuggestion[] {
  const raw = query.trim()
  if (raw.length < 1) return []
  const parts = raw.split(/\s+/).filter(Boolean)
  const out: GeoSuggestion[] = []
  const seen = new Set<string>()

  function push(item: GeoSuggestion) {
    if (seen.has(item.id) || out.length >= limit) return
    seen.add(item.id)
    out.push(item)
  }

  if (parts.length >= 2) {
    const maybeProvince = canonicalProvince(parts[0])
    const rest = parts.slice(1).join(' ')
    if (maybeProvince) {
      for (const row of districtsOf(maybeProvince)) {
        if (foldTr(row.district).startsWith(foldTr(rest)) || trIncludes(row.district, rest)) {
          push(districtSuggestion(row))
        }
      }
    }
  }

  const q = foldTr(raw)
  for (const item of PROVINCES) {
    const folded = foldTr(item.name)
    if (folded.startsWith(q) || ALIAS[q] === item.name) {
      const center = provinceCenter(item.name)
      if (!center) continue
      push({
        id: `il-${item.name}`,
        kind: 'province',
        province: item.name,
        label: item.name,
        sub: `${item.zone} · 81 ilden biri`,
        lat: center[0],
        lng: center[1],
      })
    }
  }

  const prefix: DistrictRow[] = []
  const contains: DistrictRow[] = []
  for (const row of DISTRICT_ROWS) {
    const folded = foldTr(row.district)
    if (folded.startsWith(q)) prefix.push(row)
    else if (folded.includes(q) || foldTr(row.province).startsWith(q)) contains.push(row)
  }
  for (const row of [...prefix, ...contains]) {
    if (out.length >= limit) break
    push(districtSuggestion(row))
  }

  if (out.length < limit) {
    for (const item of PROVINCES) {
      if (trIncludes(item.name, raw)) {
        const center = provinceCenter(item.name)
        if (!center) continue
        push({
          id: `il-${item.name}`,
          kind: 'province',
          province: item.name,
          label: item.name,
          sub: `${item.zone} · il`,
          lat: center[0],
          lng: center[1],
        })
      }
    }
  }

  return out
}

function districtSuggestion(row: DistrictRow): GeoSuggestion {
  const zone = zoneOfProvince(row.province)
  return {
    id: `ilce-${row.province}-${row.district}`,
    kind: 'district',
    province: row.province,
    district: row.district,
    label: row.district,
    sub: `${row.province}${zone ? ` · ${zone}` : ''}`,
    lat: row.lat,
    lng: row.lng,
  }
}

export function focusFromSuggestion(item: GeoSuggestion): GeoFocus {
  return item.kind === 'district' && item.district
    ? { province: item.province, district: item.district }
    : { province: item.province }
}
