import { findDistrict } from './admin-geo'
import { foldTr, trIncludes } from './format'
import { harvestKey, readHarvest, writeHarvest } from './geo-cache'
import { inferIntent, kindFromOsm, wikiLooksRelevant } from './intents'
import { mergePlaces } from './overpass'
import { zoneOfProvince } from './provinces'
import type { PlaceItem } from './types'

const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
const WIKI = 'https://tr.wikipedia.org/w/api.php'

function areaPreamble(province: string): string {
  const safeProvince = province.replace(/"/g, '')
  return `[out:json][timeout:28];
area["name"="${safeProvince}"]["admin_level"="4"]["boundary"="administrative"]->.a;`
}

function aroundOrArea(province: string, district: string | undefined, filters: string[]): string {
  const row = district ? findDistrict(province, district) : null
  if (row && district) {
    const around = filters.map((line) => `  ${line}(around:16000,${row.lat.toFixed(4)},${row.lng.toFixed(4)});`).join('\n')
    return `${areaPreamble(province)}
(
${around}
);
out center 200;`
  }
  const body = filters.map((line) => `  ${line}(area.a);`).join('\n')
  return `${areaPreamble(province)}
(
${body}
);
out center 220;`
}

async function overpass(query: string): Promise<Array<Record<string, unknown>>> {
  const body = `data=${encodeURIComponent(query)}`
  const attempts = OVERPASS.map(async (endpoint) => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 20000)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body,
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`overpass ${response.status}`)
      const data = (await response.json()) as { elements?: Array<Record<string, unknown>> }
      return data.elements ?? []
    } finally {
      window.clearTimeout(timer)
    }
  })
  try {
    return await Promise.any(attempts)
  } catch {
    return []
  }
}

function osmPlace(raw: Record<string, unknown>, province: string, district?: string): PlaceItem | null {
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
  const mapped = kindFromOsm(tags)
  const title = tags.name || tags['name:tr'] || `${province} ${mapped.label}`
  const ele = Number(tags.ele)
  const city = tags['addr:district'] || tags['addr:city'] || district || province
  return {
    id: `osm-${osmId}`,
    title,
    kind: mapped.kind,
    region: province,
    city,
    district: district || tags['addr:district'] || city,
    lat,
    lng,
    elevationM: Number.isFinite(ele) ? ele : 0,
    summary: `${mapped.label}. OpenStreetMap kaydı; resmi tahsis veya giriş izni değildir. Gitmeden idareyi veya muhtarlığı sorun.`,
    images: [],
    videos: [],
    zone: zoneOfProvince(province),
    statusLabel: mapped.label,
    feeTent: null,
    intent: mapped.intent,
    source: 'osm',
  }
}

async function agentNature(province: string, district?: string): Promise<PlaceItem[]> {
  const query = aroundOrArea(province, district, [
    'nwr["leisure"="picnic_site"]',
    'nwr["tourism"="picnic_site"]',
    'nwr["tourism"="camp_site"]',
    'nwr["natural"="waterfall"]',
    'nwr["waterway"="waterfall"]',
    'nwr["natural"="peak"]["name"]',
    'nwr["natural"="cave_entrance"]',
    'nwr["natural"="sinkhole"]',
    'nwr["leisure"="nature_reserve"]',
  ])
  const rows = await overpass(query)
  return rows.map((row) => osmPlace(row, province, district)).filter((item): item is PlaceItem => item !== null)
}

async function agentHistory(province: string, district?: string): Promise<PlaceItem[]> {
  const query = aroundOrArea(province, district, [
    'nwr["historic"="castle"]',
    'nwr["historic"="ruins"]',
    'nwr["historic"="archaeological_site"]',
    'nwr["historic"="monument"]',
  ])
  const rows = await overpass(query)
  return rows.map((row) => osmPlace(row, province, district)).filter((item): item is PlaceItem => item !== null)
}

interface WikiHit {
  pageid: number
  title: string
  lat: number
  lng: number
  extract: string
  thumb?: string
  url: string
}

async function wikiSearch(lat: number, lng: number): Promise<WikiHit[]> {
  const search = new URL(WIKI)
  search.searchParams.set('action', 'query')
  search.searchParams.set('list', 'geosearch')
  search.searchParams.set('gscoord', `${lat}|${lng}`)
  search.searchParams.set('gsradius', '10000')
  search.searchParams.set('gslimit', '32')
  search.searchParams.set('format', 'json')
  search.searchParams.set('origin', '*')
  const found = await fetch(search).then((response) => response.json()) as {
    query?: { geosearch?: Array<{ pageid: number; title: string; lat: number; lon: number }> }
  }
  const hits = found.query?.geosearch ?? []
  if (hits.length === 0) return []
  const ids = hits.map((item) => item.pageid).join('|')
  const detail = new URL(WIKI)
  detail.searchParams.set('action', 'query')
  detail.searchParams.set('pageids', ids)
  detail.searchParams.set('prop', 'extracts|pageimages|info')
  detail.searchParams.set('exintro', '1')
  detail.searchParams.set('explaintext', '1')
  detail.searchParams.set('pithumbsize', '640')
  detail.searchParams.set('inprop', 'url')
  detail.searchParams.set('format', 'json')
  detail.searchParams.set('origin', '*')
  const pages = await fetch(detail).then((response) => response.json()) as {
    query?: {
      pages?: Record<
        string,
        { pageid: number; title: string; extract?: string; thumbnail?: { source?: string }; fullurl?: string }
      >
    }
  }
  const byId = pages.query?.pages ?? {}
  const rows: WikiHit[] = []
  for (const hit of hits) {
    const page = byId[String(hit.pageid)]
    if (!page) continue
    const extract = page.extract ?? ''
    if (!wikiLooksRelevant(page.title, extract)) continue
    const thumb = page.thumbnail?.source
    const imageOk = Boolean(thumb && /wikimedia\.org|wikipedia\.org/.test(thumb))
    rows.push({
      pageid: hit.pageid,
      title: page.title,
      lat: hit.lat,
      lng: hit.lon,
      extract: extract.slice(0, 420) || `${page.title}. Türkçe Wikipedia özeti yok.`,
      thumb: imageOk ? thumb : undefined,
      url: page.fullurl || `https://tr.wikipedia.org/?curid=${hit.pageid}`,
    })
  }
  return rows
}

function near(a: { lat: number; lng: number }, b: { lat: number; lng: number }, km: number): boolean {
  const dlat = a.lat - b.lat
  const dlng = (a.lng - b.lng) * Math.cos((a.lat * Math.PI) / 180)
  return Math.hypot(dlat, dlng) * 111 <= km
}

function attachWiki(places: PlaceItem[], wiki: WikiHit[]): PlaceItem[] {
  return places.map((place) => {
    if (place.images.length > 0 && place.summary.length > 40) return place
    const hit =
      wiki.find((item) => foldTr(item.title) === foldTr(place.title)) ||
      wiki.find((item) => trIncludes(item.title, place.title) || trIncludes(place.title, item.title)) ||
      wiki.find((item) => near(item, place, 1.6))
    if (!hit) return place
    return {
      ...place,
      summary: place.source === 'osm' ? `${hit.extract} OSM konumuyla eşleşti.` : hit.extract,
      images: hit.thumb ? [hit.thumb] : place.images,
      wikiUrl: hit.url,
    }
  })
}

function wikiPlaces(wiki: WikiHit[], province: string, district: string | undefined, existing: PlaceItem[]): PlaceItem[] {
  const keys = new Set(existing.map((item) => foldTr(item.title)))
  const out: PlaceItem[] = []
  for (const hit of wiki) {
    if (keys.has(foldTr(hit.title))) continue
    if (existing.some((item) => near(item, hit, 0.8))) continue
    const draft: PlaceItem = {
      id: `wiki-${hit.pageid}`,
      title: hit.title,
      kind: 'doga',
      region: province,
      city: district || province,
      district: district || province,
      lat: hit.lat,
      lng: hit.lng,
      elevationM: 0,
      summary: `${hit.extract} Kaynak: Türkçe Wikipedia. Pin izin değildir.`,
      images: hit.thumb ? [hit.thumb] : [],
      videos: [],
      zone: zoneOfProvince(province),
      statusLabel: 'Wikipedia',
      feeTent: null,
      source: 'wiki',
      wikiUrl: hit.url,
    }
    draft.intent = inferIntent(draft)
    out.push(draft)
    keys.add(foldTr(hit.title))
  }
  return out
}

export interface HarvestProgress {
  nature: 'idle' | 'loading' | 'ready' | 'error'
  history: 'idle' | 'loading' | 'ready' | 'error'
  wiki: 'idle' | 'loading' | 'ready' | 'error'
}

export async function harvestArea(
  province: string,
  district?: string,
  onProgress?: (state: HarvestProgress) => void,
): Promise<PlaceItem[]> {
  const key = harvestKey(province, district)
  const cached = await readHarvest(key)
  if (cached) {
    onProgress?.({ nature: 'ready', history: 'ready', wiki: 'ready' })
    return cached
  }
  const row = district ? findDistrict(province, district) : null
  const focusLat = row?.lat
  const focusLng = row?.lng
  const progress: HarvestProgress = { nature: 'loading', history: 'loading', wiki: 'loading' }
  onProgress?.(progress)

  const natureTask = agentNature(province, district)
    .then((items) => {
      progress.nature = 'ready'
      onProgress?.({ ...progress })
      return items
    })
    .catch(() => {
      progress.nature = 'error'
      onProgress?.({ ...progress })
      return [] as PlaceItem[]
    })
  const historyTask = agentHistory(province, district)
    .then((items) => {
      progress.history = 'ready'
      onProgress?.({ ...progress })
      return items
    })
    .catch(() => {
      progress.history = 'error'
      onProgress?.({ ...progress })
      return [] as PlaceItem[]
    })

  const wikiCenter = focusLat != null && focusLng != null ? { lat: focusLat, lng: focusLng } : null
  const wikiTask = (async () => {
    const osmFirst = await Promise.all([natureTask, historyTask])
    const sample = osmFirst.flat()[0]
    const lat = wikiCenter?.lat ?? sample?.lat
    const lng = wikiCenter?.lng ?? sample?.lng
    if (lat == null || lng == null) return [] as WikiHit[]
    return wikiSearch(lat, lng)
  })()
    .then((items) => {
      progress.wiki = 'ready'
      onProgress?.({ ...progress })
      return items
    })
    .catch(() => {
      progress.wiki = 'error'
      onProgress?.({ ...progress })
      return [] as WikiHit[]
    })

  const [nature, history, wiki] = await Promise.all([natureTask, historyTask, wikiTask])
  let merged = mergePlaces(nature, history)
  merged = attachWiki(merged, wiki)
  merged = mergePlaces(merged, wikiPlaces(wiki, province, district, merged))
  await writeHarvest(key, merged)
  return merged
}
