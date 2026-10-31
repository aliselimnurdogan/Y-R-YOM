import type { PlaceItem } from './types'

const DB_NAME = 'yuruyom-14'
const STORE = 'harvest'
const MEM = new Map<string, { at: number; places: PlaceItem[] }>()
const WEEK = 7 * 24 * 60 * 60 * 1000

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => resolve(null)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
  })
}

export function harvestKey(province: string, district?: string): string {
  return `${province}|${district ?? ''}`
}

export async function readHarvest(key: string): Promise<PlaceItem[] | null> {
  const mem = MEM.get(key)
  if (mem && Date.now() - mem.at < WEEK) return mem.places
  try {
    const db = await openDb()
    if (db) {
      const row = await new Promise<{ at: number; places: PlaceItem[] } | undefined>((resolve) => {
        const tx = db.transaction(STORE, 'readonly')
        const req = tx.objectStore(STORE).get(key)
        req.onsuccess = () => resolve(req.result as { at: number; places: PlaceItem[] } | undefined)
        req.onerror = () => resolve(undefined)
      })
      db.close()
      if (row && Date.now() - row.at < WEEK && Array.isArray(row.places)) {
        MEM.set(key, row)
        return row.places
      }
    }
  } catch {
    /* IndexedDB yoksa yerel depo */
  }
  try {
    const raw = localStorage.getItem(`yuruyom14:${key}`)
    if (!raw) return null
    const row = JSON.parse(raw) as { at: number; places: PlaceItem[] }
    if (Date.now() - row.at >= WEEK || !Array.isArray(row.places)) return null
    MEM.set(key, row)
    return row.places
  } catch {
    return null
  }
}

export async function writeHarvest(key: string, places: PlaceItem[]): Promise<void> {
  const row = { at: Date.now(), places }
  MEM.set(key, row)
  try {
    const db = await openDb()
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.oncomplete = () => resolve()
        tx.onerror = () => resolve()
        tx.objectStore(STORE).put(row, key)
      })
      db.close()
      return
    }
  } catch {
    /* yerel depo */
  }
  try {
    const packed = JSON.stringify(row)
    if (packed.length < 400000) localStorage.setItem(`yuruyom14:${key}`, packed)
  } catch {
    /* kota */
  }
}
