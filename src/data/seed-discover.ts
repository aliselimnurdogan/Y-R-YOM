import { inferIntent } from '../intents'
import { zoneOfProvince } from '../provinces'
import type { PlaceItem, PlaceKind } from '../types'

interface Seed {
  id: string
  title: string
  city: string
  region: string
  lat: number
  lng: number
  elevationM: number
  kind: PlaceKind
  summary: string
  statusLabel: string
}

const RAW: Seed[] = [
  {
    id: 'kozan-kalesi',
    title: 'Kozan Kalesi',
    city: 'Kozan',
    region: 'Adana',
    lat: 37.4489,
    lng: 35.8158,
    elevationM: 720,
    kind: 'doga',
    summary: 'Kozan (Sis) kalesi. Ören yeri; geceleme yeri değildir. Giriş saati ve ücret belirsiz, gitmeden ilçe müzesini veya belediyeyi sorun.',
    statusLabel: 'Kale',
  },
  {
    id: 'anavarza',
    title: 'Anavarza Ören Yeri',
    city: 'Kozan',
    region: 'Adana',
    lat: 37.2506,
    lng: 35.9006,
    elevationM: 140,
    kind: 'doga',
    summary: 'Kozan ovasında antik Anazarbos. Kale ve su kemeri görülür. Kamp alanı değildir.',
    statusLabel: 'Ören yeri',
  },
  {
    id: 'aladag-yerkopru',
    title: 'Aladağ Yerköprü Şelalesi',
    city: 'Aladağ',
    region: 'Adana',
    lat: 37.5362,
    lng: 35.5054,
    elevationM: 650,
    kind: 'doga',
    summary: 'Aladağ’da doğal köprü ve şelale. Mut Yerköprü ile karışmasın. Mesire; tahsis belirsiz.',
    statusLabel: 'Şelale',
  },
  {
    id: 'kadirli-karatepe',
    title: 'Karatepe-Aslantaş',
    city: 'Kadirli',
    region: 'Osmaniye',
    lat: 37.2956,
    lng: 36.2536,
    elevationM: 150,
    kind: 'orman',
    summary: 'Kadirli milli park ve açık hava müzesi. Geceleme yalnızca idarenin gösterdiği yerde.',
    statusLabel: 'Milli park',
  },
  {
    id: 'maksutoglu',
    title: 'Maksutoğlu Yaylası',
    city: 'Kadirli',
    region: 'Osmaniye',
    lat: 37.178,
    lng: 36.498,
    elevationM: 1650,
    kind: 'yayla',
    summary: 'Kadirli yaylası. Tesis ve su belirsiz; erzakı ilçeden bitirin. Serbest orman kampı yasak.',
    statusLabel: 'Yayla',
  },
  {
    id: 'sumbas-cem-kale',
    title: 'Çem Kalesi',
    city: 'Sumbas',
    region: 'Osmaniye',
    lat: 37.4512,
    lng: 36.0231,
    elevationM: 420,
    kind: 'doga',
    summary: 'Sumbas Çem (Cem) kalesi. Ören; çadır yeri değildir. Yol ve giriş belirsiz.',
    statusLabel: 'Kale',
  },
  {
    id: 'caglayancerit-helete',
    title: 'Helete Yaylası',
    city: 'Çağlayancerit',
    region: 'Kahramanmaraş',
    lat: 37.748,
    lng: 37.393,
    elevationM: 1400,
    kind: 'yayla',
    summary: 'Çağlayancerit Helete. Yayla mesiresi; resmi kamp tahsisi belirsiz.',
    statusLabel: 'Yayla',
  },
  {
    id: 'caglayancerit-aksu',
    title: 'Çağlayancerit Aksu',
    city: 'Çağlayancerit',
    region: 'Kahramanmaraş',
    lat: 37.786,
    lng: 37.291,
    elevationM: 1200,
    kind: 'doga',
    summary: 'Aksu çayı çevresi mesire. Piknik; geceleme için idare veya muhtarlık sorun.',
    statusLabel: 'Mesire',
  },
  {
    id: 'andirin-kalesi',
    title: 'Andırın Kalesi',
    city: 'Andırın',
    region: 'Kahramanmaraş',
    lat: 37.5764,
    lng: 36.3502,
    elevationM: 1120,
    kind: 'doga',
    summary: 'Andırın ilçe kalesi. Gezilecek ören; kamp alanı değil.',
    statusLabel: 'Kale',
  },
  {
    id: 'azgit-kalesi',
    title: 'Azgıt Kalesi',
    city: 'Andırın',
    region: 'Kahramanmaraş',
    lat: 37.621,
    lng: 36.481,
    elevationM: 1300,
    kind: 'doga',
    summary: 'Andırın Azgıt (Pınarbaşı) kalesi. Yol ve giriş belirsiz.',
    statusLabel: 'Kale',
  },
  {
    id: 'malazgirt-kalesi',
    title: 'Malazgirt Kalesi',
    city: 'Malazgirt',
    region: 'Muş',
    lat: 39.3478,
    lng: 42.4283,
    elevationM: 1560,
    kind: 'doga',
    summary: 'Malazgirt ilçe kalesi. Tarihi yer; geceleme yeri değildir.',
    statusLabel: 'Kale',
  },
  {
    id: 'malazgirt-meydan',
    title: 'Malazgirt Meydan Muharebesi Milli Parkı',
    city: 'Malazgirt',
    region: 'Muş',
    lat: 39.355,
    lng: 42.47,
    elevationM: 1550,
    kind: 'doga',
    summary: '1071 muharebe alanı milli parkı. Anıt ve düzlük; çadır tahsisi belirsiz, gitmeden idareyi sorun.',
    statusLabel: 'Milli park',
  },
  {
    id: 'murat-koprusu',
    title: 'Murat Köprüsü',
    city: 'Malazgirt',
    region: 'Muş',
    lat: 39.308,
    lng: 42.356,
    elevationM: 1480,
    kind: 'doga',
    summary: 'Malazgirt yakınında Murat ırmağı tarihi köprü hattı. Gezilecek yer; kamp değil.',
    statusLabel: 'Köprü',
  },
]

export function seedDiscoverPlaces(): PlaceItem[] {
  return RAW.map((item) => ({
    ...item,
    images: [],
    videos: [],
    zone: zoneOfProvince(item.region),
    district: item.city,
    feeTent: null,
    intent: inferIntent(item),
    source: 'seed' as const,
  }))
}
