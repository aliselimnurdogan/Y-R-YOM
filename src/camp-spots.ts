import type { PlaceItem, PlacePano, PlaceVideo } from './types'

export type SpotKind = 'street' | 'pano' | 'photo' | 'video'

export interface CampSpot {
  id: string
  title: string
  lat: number
  lng: number
  kind: SpotKind
  heading?: number
  photo?: string
  credit?: string
  pano?: PlacePano
  video?: PlaceVideo
}

export interface CampExplore {
  ids: string[]
  province: string
  spots: CampSpot[]
}

const WIKI = {
  orman4:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Trees_in_the_forest%2C_Kahramanmara%C5%9F_04.jpg/1280px-Trees_in_the_forest%2C_Kahramanmara%C5%9F_04.jpg',
  orman5:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Trees_in_the_forest%2C_Kahramanmara%C5%9F_05.jpg/1280px-Trees_in_the_forest%2C_Kahramanmara%C5%9F_05.jpg',
  baskonus1:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Ba%C5%9Fkonu%C5%9F_Da%C4%9F%C4%B1_Ormanlar_01.jpg/1280px-Ba%C5%9Fkonu%C5%9F_Da%C4%9F%C4%B1_Ormanlar_01.jpg',
  baskonus2:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Ba%C5%9Fkonu%C5%9F_Da%C4%9F%C4%B1_Ormanlar_02.jpg/1280px-Ba%C5%9Fkonu%C5%9F_Da%C4%9F%C4%B1_Ormanlar_02.jpg',
  baskonus3:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Ba%C5%9Fkonu%C5%9F_Da%C4%9F%C4%B1_Ormanlar_03.jpg/1280px-Ba%C5%9Fkonu%C5%9F_Da%C4%9F%C4%B1_Ormanlar_03.jpg',
  tekir:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Tekir_-_panoramio.jpg/1920px-Tekir_-_panoramio.jpg',
  kepez:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Yukar%C4%B1_bah%C3%A7eden_KEPEZ_ve_berit_da%C4%9F%C4%B1_-_panoramio.jpg/1920px-Yukar%C4%B1_bah%C3%A7eden_KEPEZ_ve_berit_da%C4%9F%C4%B1_-_panoramio.jpg',
}

export const CAMP_EXPLORES: CampExplore[] = [
  {
    ids: ['baskonus-yaylasi', 'baskonus-kamp', 'baskonus'],
    province: 'Kahramanmaraş',
    spots: [
      {
        id: 'cadir',
        title: 'Çadır alanı',
        lat: 37.5666,
        lng: 36.5838,
        kind: 'photo',
        photo: WIKI.baskonus2,
        credit: 'Wikimedia Commons · Başkonuş ormanı',
      },
      {
        id: 'sedir',
        title: 'Sedir hat',
        lat: 37.5695,
        lng: 36.579,
        kind: 'photo',
        photo: WIKI.baskonus1,
        credit: 'Wikimedia Commons · Başkonuş Dağı',
      },
      {
        id: 'giris',
        title: 'Giriş',
        lat: 37.56,
        lng: 36.591,
        kind: 'street',
        heading: 310,
        credit: 'Google Sokak Görünümü. Yayla yolunda kapsama yoksa boş kalır.',
      },
    ],
  },
  {
    ids: ['yavsan-yaylasi', 'yavsan'],
    province: 'Kahramanmaraş',
    spots: [
      {
        id: 'cadir',
        title: 'Çadır alanı',
        lat: 37.4825,
        lng: 36.7028,
        kind: 'photo',
        photo: WIKI.orman4,
        credit: 'Wikimedia Commons · Kahramanmaraş ormanı',
      },
      {
        id: 'orman',
        title: 'Orman içi',
        lat: 37.485,
        lng: 36.699,
        kind: 'photo',
        photo: WIKI.orman5,
        credit: 'Wikimedia Commons · Kahramanmaraş ormanı',
      },
      {
        id: 'giris',
        title: 'Giriş',
        lat: 37.48,
        lng: 36.708,
        kind: 'street',
        heading: 40,
        credit: 'Google Sokak Görünümü. Kapsama yoksa fotoğrafa geç.',
      },
    ],
  },
  {
    ids: ['kapicam-tabiat-parki'],
    province: 'Kahramanmaraş',
    spots: [
      {
        id: 'giris',
        title: 'Giriş',
        lat: 37.492,
        lng: 37.032,
        kind: 'street',
        heading: 80,
        credit: 'Google Sokak Görünümü · Gaziantep yolu kenarı',
      },
      {
        id: 'gol',
        title: 'Göl kenarı',
        lat: 37.4935,
        lng: 37.0285,
        kind: 'photo',
        photo: WIKI.orman5,
        credit: 'Wikimedia Commons. Kapıçam göleti için özel 360 yok.',
      },
      {
        id: 'piknik',
        title: 'Piknik alanı',
        lat: 37.4908,
        lng: 37.03,
        kind: 'photo',
        photo: WIKI.baskonus3,
        credit: 'Wikimedia Commons',
      },
    ],
  },
  {
    ids: ['tekir-yaylasi', 'tekir-maras-kamp'],
    province: 'Kahramanmaraş',
    spots: [
      {
        id: 'gol',
        title: 'Göl kenarı',
        lat: 37.887,
        lng: 36.62,
        kind: 'photo',
        photo: WIKI.tekir,
        credit: 'Wikimedia Commons · Tekir',
      },
      {
        id: 'cadir',
        title: 'Çadır alanı',
        lat: 37.8852,
        lng: 36.6225,
        kind: 'photo',
        photo: WIKI.orman4,
        credit: 'Wikimedia Commons',
      },
      {
        id: 'giris',
        title: 'Giriş',
        lat: 37.882,
        lng: 36.628,
        kind: 'street',
        heading: 200,
        credit: 'Google Sokak Görünümü · Kayseri yolu',
      },
    ],
  },
  {
    ids: ['yesilgoz-mesire', 'yesilgoz'],
    province: 'Kahramanmaraş',
    spots: [
      {
        id: 'gol',
        title: 'Göl kenarı',
        lat: 37.9176,
        lng: 36.617,
        kind: 'photo',
        photo: WIKI.tekir,
        credit: 'Wikimedia Commons. Yeşilgöz için özel 360 çekim yok.',
      },
      {
        id: 'cinar',
        title: 'Çınar gölge',
        lat: 37.9184,
        lng: 36.6158,
        kind: 'photo',
        photo: WIKI.orman5,
        credit: 'Wikimedia Commons',
      },
      {
        id: 'giris',
        title: 'Giriş',
        lat: 37.915,
        lng: 36.62,
        kind: 'street',
        heading: 250,
        credit: 'Google Sokak Görünümü. Obruk kenarında kapsama yoksa boş kalır.',
      },
    ],
  },
  {
    ids: ['geben-vadisi', 'kargacayiri'],
    province: 'Kahramanmaraş',
    spots: [
      {
        id: 'vadi',
        title: 'Vadi',
        lat: 37.8,
        lng: 36.45,
        kind: 'photo',
        photo: WIKI.baskonus2,
        credit: 'Wikimedia Commons · Geben / Başkonuş kuşağı',
      },
      {
        id: 'cadir',
        title: 'Çadır alanı',
        lat: 37.803,
        lng: 36.447,
        kind: 'photo',
        photo: WIKI.baskonus3,
        credit: 'Wikimedia Commons',
      },
      {
        id: 'giris',
        title: 'Giriş',
        lat: 37.796,
        lng: 36.458,
        kind: 'street',
        heading: 20,
        credit: 'Google Sokak Görünümü. Milli park yolunda kapsama seyrek.',
      },
    ],
  },
  {
    ids: ['ali-kayasi-menzelet'],
    province: 'Kahramanmaraş',
    spots: [
      {
        id: 'teras',
        title: 'Seyir',
        lat: 37.748,
        lng: 36.796,
        kind: 'photo',
        photo: WIKI.kepez,
        credit: 'Wikimedia Commons · Kepez ve Berit bakışı',
      },
      {
        id: 'giris',
        title: 'Giriş',
        lat: 37.746,
        lng: 36.8,
        kind: 'street',
        heading: 160,
        credit: 'Google Sokak Görünümü',
      },
    ],
  },
]

const BY_ID = new Map<string, CampExplore>()
for (const item of CAMP_EXPLORES) {
  for (const id of item.ids) BY_ID.set(id, item)
}

export function exploreForPlace(placeId: string): CampExplore | undefined {
  return BY_ID.get(placeId)
}

export function streetEmbed(lat: number, lng: number, heading = 0): string {
  return `https://www.google.com/maps?output=embed&layer=c&cbll=${lat.toFixed(6)},${lng.toFixed(6)}&cbp=12,${Math.round(heading)},0,0,0`
}

function fallbackSpots(place: PlaceItem): CampSpot[] {
  const spots: CampSpot[] = []
  if (place.pano?.kind === '360') {
    spots.push({
      id: 'pano',
      title: '360° bakış',
      lat: place.lat,
      lng: place.lng,
      kind: 'pano',
      pano: place.pano,
      credit: place.pano.credit,
    })
  } else if (place.images[0] || place.pano?.url) {
    const url = place.images[0] || place.pano?.url || ''
    spots.push({
      id: 'alan',
      title: 'Alan',
      lat: place.lat,
      lng: place.lng,
      kind: 'photo',
      photo: url,
      credit: place.pano?.credit || 'Yerinde bakış',
    })
  }
  const clip = place.videos.find((item) => item.src || item.youtubeId)
  if (clip) {
    spots.push({
      id: 'video',
      title: 'Video',
      lat: place.lat,
      lng: place.lng,
      kind: 'video',
      video: clip,
      credit: clip.title,
    })
  }
  if (spots.length === 0) {
    spots.push({
      id: 'giris',
      title: 'Giriş',
      lat: place.lat,
      lng: place.lng,
      kind: 'street',
      credit: 'Google Sokak Görünümü. Bu noktada kapsama yoksa boş kalır.',
    })
  }
  return spots
}

export function spotsForPlace(place: PlaceItem): CampSpot[] {
  return exploreForPlace(place.id)?.spots ?? fallbackSpots(place)
}

export function spotKindLabel(kind: SpotKind): string {
  if (kind === 'street') return 'Sokak'
  if (kind === 'pano') return '360°'
  if (kind === 'video') return 'Video'
  return 'Foto'
}
