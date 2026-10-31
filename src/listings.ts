export type ListingKind = 'tur' | 'yemek' | 'ana'

export interface Listing {
  id: string
  kind: ListingKind
  province: string
  title: string
  host: string
  price: string
  blurb: string
  sample: boolean
  createdAt: string
}

const KEY = 'yuruyom-ilan-v1'
const MAX = 60

export const LISTING_NOTE =
  'Ücretli ilan. Kart çekimi henüz sitede yok; formu doldurunca bu tarayıcıda durur. Yayına almak için yazın. Örnek ilan işaretlidir.'

const SEED: Listing[] = [
  {
    id: 'ornek-ana-turkiye',
    kind: 'ana',
    province: 'Türkiye',
    title: 'Örnek ana sponsor',
    host: 'Marka yeri',
    price: 'Harita üstü',
    blurb: 'Türkiye haritasının üstünde durur. Örnek; gerçek sponsor değil.',
    sample: true,
    createdAt: '2026-10-31T07:50:00.000Z',
  },
  {
    id: 'ornek-ana-adana',
    kind: 'ana',
    province: 'Adana',
    title: 'Adana yürüyüş sponsoru',
    host: 'Yerel marka',
    price: 'Yan sütun',
    blurb: 'Adana seçilince yanda Sponsor diye durur. Örnek; gerçek sponsor değil.',
    sample: true,
    createdAt: '2026-10-31T07:55:00.000Z',
  },
  {
    id: 'ornek-tur-adana',
    kind: 'tur',
    province: 'Adana',
    title: 'Seyhan kıyısı ve Taşköprü yürüyüşü',
    host: 'Selin Rehber',
    price: 'Kişi 650 TL',
    blurb: 'Sabah Taşköprü, öğle Tepebağ. Grup en fazla 8. Pin izin değildir; bu ücretli yürüyüş ilanıdır.',
    sample: true,
    createdAt: '2026-10-31T08:00:00.000Z',
  },
  {
    id: 'ornek-tur-nevsehir',
    kind: 'tur',
    province: 'Nevşehir',
    title: 'Göreme vadi yürüyüşü',
    host: 'Hakan Rehber',
    price: 'Kişi 1.200 TL',
    blurb: 'Kızılçukur gün batımı. Balon değil, ayak. Su ve rüzgarlık rehberde.',
    sample: true,
    createdAt: '2026-10-31T08:10:00.000Z',
  },
  {
    id: 'ornek-yemek-adana',
    kind: 'yemek',
    province: 'Adana',
    title: 'Kebap ızgara ocağı',
    host: 'Ocakbaşı ilanı',
    price: 'Porsiyon 280 TL’den',
    blurb: 'Adana seçilince yanda Yemek önerisi diye durur. Rezervasyon siteden alınmaz; örnek ilan.',
    sample: true,
    createdAt: '2026-10-31T08:20:00.000Z',
  },
  {
    id: 'ornek-yemek-gaziantep',
    kind: 'yemek',
    province: 'Gaziantep',
    title: 'Baklava tezgahı',
    host: 'Çarşı ilanı',
    price: 'Kilo 780 TL’den',
    blurb: 'Antep seçilince çıkar. Tadım iddiası yok; örnek ilan.',
    sample: true,
    createdAt: '2026-10-31T08:30:00.000Z',
  },
  {
    id: 'ornek-yemek-istanbul',
    kind: 'yemek',
    province: 'İstanbul',
    title: 'Balık ızgara',
    host: 'İskele ilanı',
    price: 'Porsiyon 420 TL’den',
    blurb: 'İstanbul seçilince kıyı yemek ilanı. Örnek.',
    sample: true,
    createdAt: '2026-10-31T08:40:00.000Z',
  },
]

function asListing(raw: unknown): Listing | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>
  if (record.kind !== 'tur' && record.kind !== 'yemek' && record.kind !== 'ana') return null
  if (typeof record.id !== 'string' || typeof record.province !== 'string') return null
  if (typeof record.title !== 'string' || typeof record.host !== 'string') return null
  if (typeof record.price !== 'string' || typeof record.blurb !== 'string') return null
  if (typeof record.createdAt !== 'string') return null
  return {
    id: record.id,
    kind: record.kind,
    province: record.province,
    title: record.title.trim(),
    host: record.host.trim(),
    price: record.price.trim(),
    blurb: record.blurb.trim(),
    sample: record.sample === true,
    createdAt: record.createdAt,
  }
}

function loadLocal(): Listing[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map(asListing).filter((item): item is Listing => item !== null)
  } catch {
    return []
  }
}

export function loadListings(): Listing[] {
  const local = loadLocal()
  const ids = new Set(local.map((item) => item.id))
  return [...SEED.filter((item) => !ids.has(item.id)), ...local].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

export function listingsFor(province: string, kind?: ListingKind): Listing[] {
  return loadListings().filter((item) => item.province === province && (!kind || item.kind === kind))
}

export function mainSponsor(): Listing | null {
  return loadListings().find((item) => item.kind === 'ana' && item.province === 'Türkiye') ?? null
}

export function saveListing(input: Omit<Listing, 'id' | 'sample' | 'createdAt'>): Listing {
  const listing: Listing = {
    ...input,
    title: input.title.trim(),
    host: input.host.trim(),
    price: input.price.trim(),
    blurb: input.blurb.trim(),
    id: `ilan-${Date.now()}`,
    sample: false,
    createdAt: new Date().toISOString(),
  }
  const next = [...loadLocal(), listing].slice(-MAX)
  localStorage.setItem(KEY, JSON.stringify(next))
  return listing
}
