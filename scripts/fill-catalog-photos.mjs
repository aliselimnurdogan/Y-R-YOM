import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src/data/catalog.json')
const UA = 'YuruyomKampRehberi/3.0 (https://github.com/aliselimnurdogan/Y-R-YOM; educational catalog)'
const catalog = JSON.parse(readFileSync(path, 'utf8'))

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function cleanUrl(url) {
  try {
    const parsed = new URL(url)
    parsed.search = ''
    return parsed.toString()
  } catch {
    return url
  }
}

function fold(value) {
  return String(value)
    .toLocaleLowerCase('tr')
    .replaceAll('ı', 'i')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

const STOP = new Set([
  'tabiat',
  'parki',
  'milli',
  'park',
  'korunan',
  'alan',
  'alani',
  'goreti',
  'golu',
  'yayla',
  'yaylasi',
  'kanyonu',
  'selalesi',
  'orman',
  'turkiye',
  'turkey',
  'nature',
  'national',
  'reserve',
])

function parkTokens(park) {
  return fold(`${park.title} ${park.city} ${park.region}`)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4 && !STOP.has(word))
}

function bumpThumb(url) {
  return url.replace(/\/(\d+)px-/i, (_, n) => `/${Math.max(Number(n), 1920)}px-`)
}

function skipTitle(title) {
  const t = title.toLowerCase()
  return (
    t.includes('map') ||
    t.includes('harita') ||
    t.includes('diagram') ||
    t.includes('logo') ||
    t.includes('flag') ||
    t.includes('coat of arms') ||
    t.includes('icon') ||
    t.includes('satellite') ||
    t.includes('landsat') ||
    t.includes('location') ||
    t.includes('.svg')
  )
}

async function fileUrls(titles, tokens) {
  if (titles.length === 0) return []
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
    '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1920&titles=' +
    titles.map((title) => encodeURIComponent(title)).join('|')
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return []
  const data = await res.json()
  const pages = data.query?.pages ? Object.values(data.query.pages) : []
  const images = []
  for (const page of pages) {
    if (page.missing || skipTitle(String(page.title || ''))) continue
    if (tokens?.length && !tokens.some((token) => fold(page.title).includes(token))) continue
    const info = page.imageinfo?.[0]
    if (!info) continue
    if (!String(info.mime || '').startsWith('image/') || String(info.mime).includes('svg')) continue
    const src = (info.thumburl || info.url || '').replace(
      'https://thumb.wikimedia.org/',
      'https://upload.wikimedia.org/',
    )
    if (src && src.startsWith('https://')) images.push(cleanUrl(src))
  }
  return images
}

async function commonsSearch(query, tokens) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
    '&list=search&srnamespace=6&srlimit=8&srsearch=' +
    encodeURIComponent(query)
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return []
  const data = await res.json()
  const titles = (data.query?.search ?? []).map((row) => row.title).filter((title) => !skipTitle(title))
  return fileUrls(titles, tokens)
}

async function wikiFiles(title, tokens) {
  const url =
    'https://tr.wikipedia.org/w/api.php?action=query&format=json&origin=*' +
    '&prop=pageimages|images&piprop=original|name&imlimit=25&titles=' +
    encodeURIComponent(title)
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA } })
  if (!res.ok) return []
  const data = await res.json()
  const page = data.query?.pages ? Object.values(data.query.pages)[0] : null
  if (!page || page.missing) return []
  const titles = []
  if (page.pageimage) titles.push(`File:${page.pageimage}`)
  for (const item of page.images ?? []) {
    if (item.title && !skipTitle(item.title)) titles.push(item.title)
  }
  return fileUrls(titles.slice(0, 8), tokens)
}

const EXTRA_QUERIES = {
  'kinik-selalesi': ['Kınık Şelalesi Osmaneli', 'Kınık waterfall Bilecik'],
  hasdal: ['Hasdal orman İstanbul', 'Kağıthane Hasdal Tabiat Parkı'],
  'karlik-yaylasi': ['Karlık Yaylası Yalova', 'Karlık Yaylası Çınarcık'],
  karanlikdere: ['Karanlıkdere Kanyonu Ula', 'Karanlıkdere Muğla'],
  'geben-vadisi': ['Geben Vadisi Andırın', 'Geben Kahramanmaraş'],
  karamanastir: ['Karamanastır Şelalesi Erdemli', 'Karamanastır Mersin'],
  yakupabdal: ['Yakupabdal Bayburt', 'Yakupabdal Tabiat Parkı'],
  arkutdagi: ['Arkutdağı Gerede', 'Arkutdağı Tabiat Parkı'],
  deregol: ['Deregöl Kıbrıscık', 'Deregöl Bolu'],
  'karaca-tp': ['Karaca Tabiat Parkı Bolu', 'Karacaorman Bolu'],
  'kargali-golcuk': ['Kargalı Gölcük Seben', 'Kargalı Gölcük Bolu'],
  'aksu-tp': ['Aksu Tabiat Parkı Çorum', 'Aksu Çorum tabiat'],
  handuzu: ['Handüzü İkizdere', 'Handüzü Tabiat Parkı'],
  'tunca-vadisi': ['Tunca Vadisi Ardeşen', 'Tunca Vadisi Rize'],
  'catak-kanyonu-sinop': ['Çatak Kanyonu Erfelek', 'Çatak Kanyonu Sinop'],
  danaagzi: ['Danaağzı Ereğli', 'Danaağzı Tabiat Parkı Zonguldak'],
  harmankaya: ['Harmankaya Şelalesi Zonguldak', 'Harmankaya waterfall'],
  saricali: ['Sarıçalı Milli Parkı', 'Sarıçalı Beypazarı'],
  'dumanli-tp': ['Dumanlı Tabiat Parkı Erzincan', 'Dumanlı Erzincan'],
  'huzurlu-tp': ['Huzurlu Tabiat Parkı Gaziantep', 'Huzurlu yaylası'],
  kucukelmali: ['Küçükelmalı Pazaryeri', 'Küçükelmalı göleti'],
  ortaburun: ['Ortaburun Tabiat Parkı Yalova', 'Ortaburun Çınarcık'],
  yerkopru: ['Yerköprü Şelalesi Mut', 'Yerköprü Mut'],
  ayikayasi: ['Ayıkayası Mengen', 'Ayıkayası Tabiat Parkı'],
  'zinav-golu': ['Zinav Gölü Reşadiye', 'Zinav Gölü Tokat'],
  kayalidere: ['Kayalıdere Devrek', 'Kayalıdere Tabiat Parkı'],
}

for (const park of catalog) {
  park.images = park.images.map((url) => bumpThumb(cleanUrl(url)))
  if (park.images.length >= 5) continue
  process.stdout.write(`fill ${park.id} (${park.images.length})\n`)
  const queries = EXTRA_QUERIES[park.id] ?? [park.title]
  const tokens = parkTokens(park)
  const found = []
  try {
    for (const query of queries) {
      let extra = await commonsSearch(query, tokens)
      if (extra.length === 0) extra = await commonsSearch(query)
      for (const url of extra) {
        if (!found.includes(url) && !park.images.includes(url)) found.push(url)
      }
      await sleep(180)
    }
    let wiki = await wikiFiles(park.title, tokens)
    if (wiki.length === 0) wiki = await wikiFiles(park.title)
    for (const url of wiki) {
      if (!found.includes(url) && !park.images.includes(url)) found.push(url)
    }
  } catch (error) {
    process.stdout.write(`  fail ${error instanceof Error ? error.message : error}\n`)
  }
  park.images = [...park.images, ...found].slice(0, 5)
  process.stdout.write(`  -> ${park.images.length}\n`)
  await sleep(200)
}

const json = `${JSON.stringify(catalog, null, 2)}\n`
writeFileSync(path, json)
writeFileSync(join(root, 'public/data/catalog.json'), json)
const withPhotos = catalog.filter((item) => item.images.length >= 3).length
const withAny = catalog.filter((item) => item.images.length > 0).length
const none = catalog.filter((item) => item.images.length === 0).map((item) => item.title)
console.log(`photos>=3 ${withPhotos}; any ${withAny}; none ${none.length}`)
if (none.length) console.log(none.join('\n'))
