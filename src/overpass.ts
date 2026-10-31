import { inferIntent, INTENT_STATUS, osmStatus } from './intents'
import { foldTr } from './format'
import { zoneOfProvince } from './provinces'
import type { PlaceItem, PlaceKind } from './types'

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
  const query = `[out:json][timeout:28];
area["name"="${province}"]["admin_level"="4"]["boundary"="administrative"]->.a;
(
  nwr["tourism"="camp_site"](area.a);
  nwr["tourism"="caravan_site"](area.a);
  nwr["tourism"="picnic_site"](area.a);
  nwr["leisure"="picnic_site"](area.a);
  nwr["leisure"="picnic_table"](area.a);
  nwr["leisure"="park"](area.a);
  nwr["leisure"="nature_reserve"](area.a);
  nwr["historic"~"castle|ruins|archaeological_site|monument"](area.a);
  nwr["tourism"="museum"](area.a);
  nwr["amenity"="museum"](area.a);
  nwr["natural"~"waterfall|cave_entrance|spring|peak|beach"]["name"](area.a);
  nwr["leisure"="beach_resort"](area.a);
  nwr["tourism"~"viewpoint|attraction"]["name"](area.a);
);
out center 320;`
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
  const mapped = osmStatus(tags)
  const kind: PlaceKind =
    mapped.label === 'Sahil'
      ? 'sahil'
      : mapped.intent === 'yayla'
        ? 'kamp'
        : mapped.intent === 'gol'
          ? 'gol'
          : mapped.intent === 'piknik'
            ? 'doga'
            : 'doga'
  return {
    id: `osm-${osmId}`,
    title,
    kind,
    region: province,
    city: tags['addr:district'] || tags['addr:city'] || province,
    district: tags['addr:district'] || tags['addr:city'] || province,
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
  }
}

export async function fetchWikiGeo(province: string, lat: number, lng: number): Promise<PlaceItem[]> {
  try {
    const search = new URL('https://tr.wikipedia.org/w/api.php')
    search.searchParams.set('action', 'query')
    search.searchParams.set('list', 'geosearch')
    search.searchParams.set('gscoord', `${lat}|${lng}`)
    search.searchParams.set('gsradius', '10000')
    search.searchParams.set('gslimit', '24')
    search.searchParams.set('format', 'json')
    search.searchParams.set('origin', '*')
    const found = (await fetch(search).then((response) => response.json())) as {
      query?: { geosearch?: Array<{ pageid: number; title: string; lat: number; lon: number }> }
    }
    const hits = found.query?.geosearch ?? []
    if (hits.length === 0) return []
    const ids = hits.map((item) => item.pageid).join('|')
    const detail = new URL('https://tr.wikipedia.org/w/api.php')
    detail.searchParams.set('action', 'query')
    detail.searchParams.set('pageids', ids)
    detail.searchParams.set('prop', 'extracts|pageimages|info')
    detail.searchParams.set('exintro', '1')
    detail.searchParams.set('explaintext', '1')
    detail.searchParams.set('pithumbsize', '640')
    detail.searchParams.set('inprop', 'url')
    detail.searchParams.set('format', 'json')
    detail.searchParams.set('origin', '*')
    const pages = (await fetch(detail).then((response) => response.json())) as {
      query?: {
        pages?: Record<
          string,
          { title: string; extract?: string; thumbnail?: { source?: string }; fullurl?: string }
        >
      }
    }
    const byId = pages.query?.pages ?? {}
    const useful = /kale|oren|hoyuk|selale|kanyon|yayla|tabiat|milli park|piknik|mesire|gol|magara|obruk|kamp|muze|museum|sahil|plaj|orman|anit/
    const out: PlaceItem[] = []
    for (const hit of hits) {
      const page = byId[String(hit.pageid)]
      if (!page) continue
      const extract = page.extract ?? ''
      if (!useful.test(foldTr(`${page.title} ${extract}`))) continue
      const thumb = page.thumbnail?.source
      const imageOk = Boolean(thumb && /wikimedia\.org|wikipedia\.org/.test(thumb))
      const intent = inferIntent({ title: page.title, kind: 'doga', summary: extract })
      out.push({
        id: `wiki-${hit.pageid}`,
        title: page.title,
        kind: intent === 'gol' ? 'gol' : intent === 'yayla' ? 'kamp' : 'doga',
        region: province,
        city: province,
        lat: hit.lat,
        lng: hit.lon,
        elevationM: 0,
        summary: `${(extract || page.title).slice(0, 360)} Kaynak: Türkçe Wikipedia. Pin izin değildir.`,
        images: imageOk && thumb ? [thumb] : [],
        videos: [],
        zone: zoneOfProvince(province),
        statusLabel: INTENT_STATUS[intent],
        feeTent: null,
        intent,
      })
    }
    return out
  } catch {
    return []
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
