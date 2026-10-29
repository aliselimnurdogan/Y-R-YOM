import type { Activity, Difficulty, PlaceKind } from './types'

export const PLACE_KINDS: PlaceKind[] = ['kamp', 'yayla', 'doga', 'manzara']

export const PLACE_KIND_LABELS: Record<PlaceKind, string> = {
  kamp: 'Kamp',
  yayla: 'Yayla',
  doga: 'Doğa',
  manzara: 'Manzara',
}

export const PLACE_KIND_COLORS: Record<PlaceKind, string> = {
  kamp: '#6d4c41',
  yayla: '#2f7d32',
  doga: '#1565c0',
  manzara: '#c79200',
}

export const MARAS_CENTER: [number, number] = [37.58, 36.92]
export const MARAS_ZOOM = 9

export const PLACE_SORTS = [
  { id: 'featured', label: 'Öne çıkan' },
  { id: 'name', label: 'Ada göre' },
  { id: 'high', label: 'En yüksek' },
] as const

export type PlaceSortKey = (typeof PLACE_SORTS)[number]['id']

export const ACTIVITIES: Activity[] = ['hiking', 'mtb', 'running', 'kayak', 'camping', 'cycling']

export const ACTIVITY_LABELS: Record<Activity, string> = {
  hiking: 'Doğa yürüyüşü',
  mtb: 'Dağ bisikleti',
  running: 'Koşu',
  kayak: 'Kano',
  camping: 'Kamp',
  cycling: 'Bisiklet',
}

export const ACTIVITY_COLORS: Record<Activity, string> = {
  hiking: '#2f7d32',
  mtb: '#e65100',
  running: '#1565c0',
  kayak: '#00838f',
  camping: '#6d4c41',
  cycling: '#c79200',
}

export const DIFFICULTIES: Difficulty[] = ['Kolay', 'Orta', 'Zor', 'Çok zor']
