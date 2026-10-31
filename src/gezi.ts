import bundledGezi from './data/gezi-yerler.json'
import type { PlaceItem } from './types'

export const GEZI_KIND_ORDER = ['Tarihî yer', 'Müze', 'Tiyatro', 'Doğal alan'] as const

export const GEZI_NOTE =
  'Konumlar yaklaşık. Gitmeden açık/kapalı ve — özellikle deprem bölgesinde — yapının durumunu kontrol edin. Pin izin değildir.'

export const GEZI_COUNT = bundledGezi.length
export const GEZI_IL_COUNT = new Set(bundledGezi.map((item) => item.region)).size

export function isGeziPlace(place: { id: string }): boolean {
  return place.id.startsWith('gezi-')
}

export type GeziDistrictGroup = { name: string; items: PlaceItem[] }
export type GeziKindGroup = { label: string; districts: GeziDistrictGroup[] }

function byDistrict(items: PlaceItem[]): GeziDistrictGroup[] {
  const map = new Map<string, PlaceItem[]>()
  for (const place of items) {
    const name = place.district || place.city || 'İlçe belirsiz'
    const list = map.get(name)
    if (list) list.push(place)
    else map.set(name, [place])
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'tr'))
    .map(([name, group]) => ({
      name,
      items: [...group].sort((a, b) => a.title.localeCompare(b.title, 'tr')),
    }))
}

export function groupGeziPlaces(places: PlaceItem[]): GeziKindGroup[] {
  const used = new Set<string>()
  const groups: GeziKindGroup[] = []
  for (const label of GEZI_KIND_ORDER) {
    const items = places.filter((place) => place.statusLabel === label)
    if (items.length === 0) continue
    for (const place of items) used.add(place.id)
    groups.push({ label, districts: byDistrict(items) })
  }
  const rest = places.filter((place) => !used.has(place.id))
  if (rest.length > 0) {
    groups.push({ label: 'Kamp, mesire ve diğer', districts: byDistrict(rest) })
  }
  return groups
}
