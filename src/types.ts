export type PlaceKind = 'kamp' | 'yayla' | 'doga' | 'manzara' | 'sahil' | 'orman' | 'gol'

export interface PlaceVideo {
  youtubeId: string
  title: string
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
}

export interface PlaceComment {
  id: string
  placeId: string
  name: string
  text: string
  photo?: string
  createdAt: string
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
