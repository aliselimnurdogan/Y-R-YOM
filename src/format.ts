import type { Difficulty, PlaceItem, RouteItem } from './types'

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function foldTr(value: string): string {
  return value
    .toLocaleLowerCase('tr')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
}

export function trIncludes(haystack: string, needle: string): boolean {
  const q = needle.trim()
  if (!q) return true
  return haystack.toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr')) || foldTr(haystack).includes(foldTr(q))
}

export function matchesPlace(place: PlaceItem, query: string): boolean {
  const q = query.trim()
  if (!q) return true
  return (
    trIncludes(place.title, q) ||
    trIncludes(place.city, q) ||
    trIncludes(place.region, q) ||
    trIncludes(place.summary, q) ||
    trIncludes(place.kind, q) ||
    (place.zone ? trIncludes(place.zone, q) : false) ||
    (place.statusLabel ? trIncludes(place.statusLabel, q) : false) ||
    (place.district ? trIncludes(place.district, q) : false)
  )
}

export function matchesRoute(route: RouteItem, query: string): boolean {
  const q = query.trim()
  if (!q) return true
  return (
    trIncludes(route.title, q) ||
    trIncludes(route.city, q) ||
    trIncludes(route.region, q)
  )
}

export function formatKm(n: number): string {
  const rounded = Math.round(n * 10) / 10
  const digits = Number.isInteger(rounded) ? 0 : 1
  return rounded.toLocaleString('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: 1,
  })
}

export function formatDuration(min: number): string {
  if (!Number.isFinite(min) || min < 0) return '—'
  const total = Math.round(min)
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  if (hours <= 0) return `${minutes} dk`
  if (minutes === 0) return `${hours} sa`
  return `${hours} sa ${minutes} dk`
}

export function featuredScore(route: RouteItem): number {
  const count = Math.max(0, route.ratingCount)
  return route.rating * Math.log10(count + 1)
}

export function formatInt(n: number): string {
  return Math.round(n).toLocaleString('tr-TR')
}

export function formatFee(fee: number | null | undefined): string {
  if (fee == null) return 'Tarife yok'
  return `${formatInt(fee)} TL`
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr')
  const first = parts[0][0] ?? ''
  const last = parts[parts.length - 1][0] ?? ''
  return (first + last).toLocaleUpperCase('tr')
}

export function placeCover(place: PlaceItem): string {
  return place.images[0] || place.pano?.preview || place.pano?.url || ''
}

export function hasPlacePhoto(place: PlaceItem): boolean {
  return Boolean(placeCover(place))
}

export function difficultyClass(difficulty: Difficulty): string {
  if (difficulty === 'Kolay') return 'kolay'
  if (difficulty === 'Orta') return 'orta'
  if (difficulty === 'Zor') return 'zor'
  return 'cok'
}
