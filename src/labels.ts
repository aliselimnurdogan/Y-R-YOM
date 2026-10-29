import type { Activity, Difficulty, PlaceKind } from './types'

export const PLACE_KINDS: PlaceKind[] = ['kamp', 'yayla', 'doga', 'manzara']

export const CAMP_KINDS: PlaceKind[] = ['sahil', 'orman', 'yayla', 'gol']

export const ALL_PLACE_KINDS: PlaceKind[] = ['kamp', 'yayla', 'doga', 'manzara', 'sahil', 'orman', 'gol']

export const PLACE_KIND_LABELS: Record<PlaceKind, string> = {
  kamp: 'Kamp',
  yayla: 'Yayla',
  doga: 'Doğa',
  manzara: 'Manzara',
  sahil: 'Sahil',
  orman: 'Orman',
  gol: 'Göl',
}

export const PLACE_KIND_COLORS: Record<PlaceKind, string> = {
  kamp: '#6d4c41',
  yayla: '#2f7d32',
  doga: '#1565c0',
  manzara: '#c79200',
  sahil: '#00838f',
  orman: '#33691e',
  gol: '#1565c0',
}

export const MARAS_CENTER: [number, number] = [37.58, 36.92]
export const MARAS_ZOOM = 9
export const TURKEY_CENTER: [number, number] = [39.1, 35.2]
export const TURKEY_ZOOM = 6

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

export const DISTANCE_BANDS = [
  { id: '0-5', label: '0–5 km', match: (km: number) => km >= 0 && km <= 5 },
  { id: '5-10', label: '5–10 km', match: (km: number) => km > 5 && km <= 10 },
  { id: '10-20', label: '10–20 km', match: (km: number) => km > 10 && km <= 20 },
  { id: '20+', label: '20+ km', match: (km: number) => km > 20 },
] as const

export const CLIMB_BANDS = [
  { id: '0-250', label: '0–250 m', match: (m: number) => m >= 0 && m <= 250 },
  { id: '250-750', label: '250–750 m', match: (m: number) => m > 250 && m <= 750 },
  { id: '750-1500', label: '750–1500 m', match: (m: number) => m > 750 && m <= 1500 },
  { id: '1500+', label: '1500+ m', match: (m: number) => m > 1500 },
] as const

export type DistanceBandId = (typeof DISTANCE_BANDS)[number]['id']
export type ClimbBandId = (typeof CLIMB_BANDS)[number]['id']

export const SORTS = [
  { id: 'featured', label: 'Öne çıkan' },
  { id: 'longest', label: 'En uzun' },
  { id: 'shortest', label: 'En kısa' },
  { id: 'climb', label: 'En çok tırmanış' },
] as const

export type SortKey = (typeof SORTS)[number]['id']
