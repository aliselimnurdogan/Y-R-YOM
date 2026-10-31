import { foldTr } from './format'
import type { PlaceItem } from './types'

export const TOUR_INTENTS = [
  { id: 'tarih', label: 'Kale & Tarih', hint: 'Kale, höyük, ören yeri' },
  { id: 'piknik', label: 'Piknik & Mesire', hint: 'Mesire, piknik, yol üstü' },
  { id: 'yayla', label: 'Yayla & Kamp', hint: 'Yayla, kamp, konak' },
  { id: 'su', label: 'Şelale & Kanyon', hint: 'Şelale, kanyon, obruk, mağara' },
  { id: 'gol', label: 'Göl & Tabiat Parkı', hint: 'Göl, tabiat parkı, milli park' },
] as const

export type TourIntent = (typeof TOUR_INTENTS)[number]['id']

export const INTENT_STATUS: Record<TourIntent, string> = {
  tarih: 'Tarihi Kale',
  piknik: 'Piknik & Mesire',
  yayla: 'Yayla & Kamp',
  su: 'Şelale & Doğa',
  gol: 'Tabiat Alanı',
}

const WATER = /kanyon|selale|şelale|obruk|magara|mağara|waterfall|gorge|cave|goze|göze|kapuzbasi|yerkopru|karacay|kırksu|kirksu|domuzdere/
const HISTORY = /kale|castle|ruins|hoyuk|höyük|oren|ören|historic|muharebe|malazgirt|karatepe|anavarza|çem|cem kale|azgit|hatun kopru/
const PICNIC = /piknik|picnic|mesire|dagilcak|dağılcak|camlik|çamlık|savrun|dokuzoluk/
const LAKE = /göl|gol |tabiat park|milli park|obruk göl|yesilgoz|yeşilgöz|hacli|haçlı/
const HIGHLAND = /kamp|yayla|camp_site|nature_reserve|orman/

export function inferIntent(place: Pick<PlaceItem, 'title' | 'kind' | 'summary' | 'statusLabel' | 'intent'>): TourIntent {
  if (place.intent) return place.intent
  const blob = foldTr(`${place.title} ${place.summary} ${place.statusLabel ?? ''} ${place.kind}`)
  if (HISTORY.test(blob)) return 'tarih'
  if (WATER.test(blob)) return 'su'
  if (PICNIC.test(blob)) return 'piknik'
  if (LAKE.test(blob) || place.kind === 'gol') return 'gol'
  if (HIGHLAND.test(blob) || place.kind === 'yayla' || place.kind === 'kamp' || place.kind === 'orman') return 'yayla'
  return 'yayla'
}

export function osmStatus(tags: Record<string, string>): { intent: TourIntent; label: string } {
  const historic = tags.historic
  const natural = tags.natural
  const leisure = tags.leisure
  const tourism = tags.tourism
  if (historic === 'castle' || historic === 'ruins' || historic === 'archaeological_site') {
    return { intent: 'tarih', label: 'Tarihi Kale' }
  }
  if (natural === 'waterfall' || natural === 'cave_entrance' || natural === 'spring') {
    return { intent: 'su', label: 'Şelale & Doğa' }
  }
  if (leisure === 'picnic_site' || tourism === 'picnic_site' || leisure === 'picnic_table') {
    return { intent: 'piknik', label: 'Piknik & Mesire' }
  }
  if (leisure === 'nature_reserve' || leisure === 'park' || tourism === 'attraction') {
    return { intent: 'gol', label: 'Tabiat Alanı' }
  }
  if (tourism === 'camp_site' || tourism === 'caravan_site') {
    return { intent: 'yayla', label: 'Yayla & Kamp' }
  }
  if (tourism === 'viewpoint') return { intent: 'gol', label: 'Tabiat Alanı' }
  if (natural === 'peak') return { intent: 'yayla', label: 'Tabiat Alanı' }
  return { intent: 'yayla', label: 'OSM nokta' }
}
