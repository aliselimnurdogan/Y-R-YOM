import type { Difficulty, PlaceItem } from './types'

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

export function matchesQuery(place: PlaceItem, query: string): boolean {
  const q = query.trim()
  if (!q) return true
  return (
    trIncludes(place.title, q) ||
    trIncludes(place.city, q) ||
    trIncludes(place.summary, q) ||
    trIncludes(place.kind, q)
  )
}

export function formatInt(n: number): string {
  return Math.round(n).toLocaleString('tr-TR')
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

export function difficultyClass(difficulty: Difficulty): string {
  if (difficulty === 'Kolay') return 'kolay'
  if (difficulty === 'Orta') return 'orta'
  if (difficulty === 'Zor') return 'zor'
  return 'cok'
}
