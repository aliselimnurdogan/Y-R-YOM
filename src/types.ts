export type PlaceKind = 'kamp' | 'yayla' | 'doga' | 'manzara' | 'sahil' | 'orman' | 'gol'

export interface PlaceVideo {
  youtubeId?: string
  src?: string
  title: string
}

export type FacilityFlag = 'var' | 'yok' | 'belirsiz'
export type FirewoodFlag = 'getir' | 'yerinde' | 'yasak' | 'belirsiz'
export type FireFlag = 'yasak' | 'ocak' | 'belirsiz'
export type ShopFlag = 'var' | 'yok' | 'yakin' | 'belirsiz'

export interface CampGuide {
  toilet: FacilityFlag
  power: FacilityFlag
  water: FacilityFlag
  firewood: FirewoodFlag
  fire: FireFlag
  shop: ShopFlag
  difficulty: string
  pros: string[]
  cons: string[]
  tips: string[]
  advice: string
}

export type PanoKind = '360' | 'pano' | 'view'

export interface PlacePano {
  url: string
  preview?: string
  credit: string
  kind: PanoKind
  width?: number
  height?: number
}

export interface PlaceItem {
  id: string
  title: string
  kind: PlaceKind
  region: string
  city: string
  lat: number
  lng: number
  elevationM: number
  summary: string
  images: string[]
  videos: PlaceVideo[]
  zone?: string
  areaHa?: number
  feeTent?: number | null
  statusLabel?: string
  guide?: CampGuide
  pano?: PlacePano
  district?: string
  intent?: 'tarih' | 'piknik' | 'yayla' | 'su' | 'gol'
}

export interface PlaceScores {
  nature: number
  clean: number
  access: number
  safety: number
}

export interface PlaceComment {
  id: string
  placeId: string
  name: string
  text: string
  photo?: string
  createdAt: string
  scores?: PlaceScores
}

export type Activity = 'hiking' | 'mtb' | 'running' | 'kayak' | 'camping' | 'cycling'
export type Difficulty = 'Kolay' | 'Orta' | 'Zor' | 'Çok zor'

export interface Waypoint {
  name: string
  lat: number
  lng: number
}

export interface RouteItem {
  id: string
  title: string
  activity: Activity
  region: string
  city: string
  difficulty: Difficulty
  loop: boolean
  distanceKm: number
  elevationGainM: number
  elevationLossM: number
  maxElevationM: number
  minElevationM: number
  durationMin: number
  rating: number
  ratingCount: number
  author: string
  recordedAt: string
  description: string
  image: string
  track: [number, number, number][]
  waypoints: Waypoint[]
}
