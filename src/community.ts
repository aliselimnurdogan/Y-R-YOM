import type { PlaceComment } from './types'

const STORAGE_KEY = 'yuruyom-adim2-community-v1'
const MAX_COMMENTS = 40
const MAX_PHOTO_CHARS = 900_000

function asComment(raw: unknown): PlaceComment | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>
  if (typeof record.id !== 'string' || typeof record.placeId !== 'string') return null
  if (typeof record.name !== 'string' || typeof record.text !== 'string') return null
  if (typeof record.createdAt !== 'string') return null
  const comment: PlaceComment = {
    id: record.id,
    placeId: record.placeId,
    name: record.name,
    text: record.text,
    createdAt: record.createdAt,
  }
  if (typeof record.photo === 'string' && record.photo.startsWith('data:image/')) {
    comment.photo = record.photo
  }
  return comment
}

export function loadComments(placeId: string): PlaceComment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(asComment)
      .filter((item): item is PlaceComment => item !== null && item.placeId === placeId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch {
    return []
  }
}

function loadAll(): PlaceComment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map(asComment).filter((item): item is PlaceComment => item !== null)
  } catch {
    return []
  }
}

export function saveComment(comment: PlaceComment): PlaceComment[] {
  const all = loadAll().filter((item) => item.id !== comment.id)
  all.push(comment)
  const trimmed = all.slice(-Math.max(80, MAX_COMMENTS * 4))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  return loadComments(comment.placeId).slice(0, MAX_COMMENTS)
}

export async function compressPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Yalnızca resim yükleyebilirsin.')
  if (file.size > 6_000_000) throw new Error('Fotoğraf 6 MB’den küçük olsun.')
  const bitmap = await createImageBitmap(file)
  const max = 1280
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Fotoğraf işlenemedi.')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const data = canvas.toDataURL('image/jpeg', 0.72)
  if (data.length > MAX_PHOTO_CHARS) throw new Error('Fotoğraf biraz daha küçük olsun.')
  return data
}
