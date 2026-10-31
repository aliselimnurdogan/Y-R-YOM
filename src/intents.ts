import { foldTr } from './format'
import type { PlaceItem, PlaceKind } from './types'

export const DISCOVER_INTENTS = [
  {
    id: 'piknik',
    label: 'Yol Üstü Durak & Piknik',
    hint: 'Mesire, piknik, yol üstü durak',
  },
  {
    id: 'tarih',
    label: 'Tarihi Kale & Ören Yeri',
    hint: 'Kale, höyük, ören yeri',
  },
  {
    id: 'yayla',
    label: 'Yayla, Kamp & Tabiat',
    hint: 'Yayla, kamp, tabiat parkı',
  },
  {
    id: 'su',
    label: 'Kanyon, Şelale & Obruk',
    hint: 'Kanyon, şelale, obruk, mağara',
  },
] as const

export type DiscoverIntent = (typeof DISCOVER_INTENTS)[number]['id']

const WATER = /kanyon|selale|şelale|obruk|magara|mağara|waterfall|gorge|sinkhole|cave|goze|göze|yesilgoz|yeşilgöz|kapuzbasi|kapuzbaşı|yerkopru|yerköprü/
const HISTORY =
  /kale|castle|ruins|hoyuk|höyük|oren|ören|anit|anıt|historic|hisar|muharebe|kopru|köprü|malazgirt|karatepe|anavarza|cem kale|çem/
const PICNIC = /piknik|picnic|mesire|durak|dinlenme|rest.?area/
const HIGHLAND = /kamp|yayla|tabiat|camp_site|nature_reserve|orman|milli park|peak|zirve/

export function inferIntent(place: Pick<PlaceItem, 'title' | 'kind' | 'summary' | 'statusLabel' | 'intent'>): DiscoverIntent {
  if (place.intent) return place.intent
  const blob = foldTr(`${place.title} ${place.summary} ${place.statusLabel ?? ''} ${place.kind}`)
  if (WATER.test(blob)) return 'su'
  if (HISTORY.test(blob)) return 'tarih'
  if (PICNIC.test(blob)) return 'piknik'
  if (place.kind === 'yayla' || place.kind === 'kamp' || place.kind === 'orman') return 'yayla'
  if (HIGHLAND.test(blob)) return 'yayla'
  if (place.kind === 'gol' || place.kind === 'doga') return 'su'
  return 'yayla'
}

export function intentLabel(id: DiscoverIntent): string {
  return DISCOVER_INTENTS.find((item) => item.id === id)?.label ?? id
}

export function kindFromOsm(tags: Record<string, string>): { kind: PlaceKind; intent: DiscoverIntent; label: string } {
  const historic = tags.historic
  const natural = tags.natural
  const leisure = tags.leisure
  const tourism = tags.tourism
  const waterway = tags.waterway
  if (historic === 'castle' || historic === 'ruins' || historic === 'archaeological_site' || historic === 'monument') {
    return { kind: 'doga', intent: 'tarih', label: historic === 'castle' ? 'OSM kale' : 'OSM ören' }
  }
  if (natural === 'waterfall' || waterway === 'waterfall') {
    return { kind: 'doga', intent: 'su', label: 'OSM şelale' }
  }
  if (natural === 'cave_entrance' || natural === 'sinkhole') {
    return { kind: 'doga', intent: 'su', label: natural === 'sinkhole' ? 'OSM obruk' : 'OSM mağara' }
  }
  if (leisure === 'picnic_site' || tourism === 'picnic_site') {
    return { kind: 'doga', intent: 'piknik', label: 'OSM piknik' }
  }
  if (tourism === 'camp_site' || tourism === 'caravan_site') {
    return { kind: 'kamp', intent: 'yayla', label: tourism === 'caravan_site' ? 'OSM karavan' : 'OSM kamp' }
  }
  if (leisure === 'nature_reserve') {
    return { kind: 'orman', intent: 'yayla', label: 'OSM tabiat' }
  }
  if (natural === 'peak') {
    return { kind: 'manzara', intent: 'yayla', label: 'OSM zirve' }
  }
  return { kind: 'doga', intent: 'yayla', label: 'OSM nokta' }
}

export function wikiLooksRelevant(title: string, extract: string): boolean {
  const blob = foldTr(`${title} ${extract}`)
  return WATER.test(blob) || HISTORY.test(blob) || PICNIC.test(blob) || HIGHLAND.test(blob)
}
