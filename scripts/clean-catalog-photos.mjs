import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src/data/catalog.json')
const UA = 'YuruyomKampRehberi/3.0 (https://github.com/aliselimnurdogan/Y-R-YOM; educational catalog)'
const catalog = JSON.parse(readFileSync(path, 'utf8'))

const STOP = new Set([
  'tabiat',
  'parki',
  'park',
  'milli',
  'cadirli',
  'kamp',
  'alani',
  'area',
  'nature',
  'national',
  'turkey',
  'turkiye',
  'selalesi',
  'waterfall',
  'kanyon',
  'kanyonu',
  'gol',
  'golu',
  'dag',
  'dagi',
  'yaylasi',
  'orman',
  'ada',
  'adasi',
  'vadisi',
  'the',
  'and',
  'from',
  'view',
  'merkez',
  'geben',
])

function fold(value) {
  return value
    .toLocaleLowerCase('tr')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokensFor(park) {
  const extra = {
    'ayvalik-adalari': ['ayvalik', 'seytan sofrasi'],
    'buyukada-tp': ['buyukada tabiat', 'buyukada nature'],
    dilburnu: ['dilburnu'],
    'hacet-deresi': ['hacet deresi', 'hacet'],
    'suadiye-tp': ['suadiye tabiat'],
    poyrazlar: ['poyrazlar'],
    kartaltepe: ['kartaltepe'],
    ortaburun: ['ortaburun tabiat'],
    'geben-vadisi': ['geben vadisi', 'andirin'],
    'isparta-golcuk': ['isparta golcuk', 'isparta gölcük'],
    altiparmak: ['altiparmak', 'alti parmak'],
    'calcamili': ['calcamili', 'cal camili'],
    kayalidere: ['kayalidere tabiat', 'devrek'],
    'dumanli-tp': ['dumanli tabiat', 'erzincan'],
    'beskayalar': ['beskayalar'],
    'catak-corum': ['catak tabiat'],
  }
  const fromTitle = fold(park.title)
    .split(' ')
    .filter((word) => word.length >= 5 && !STOP.has(word))
  const fromCity = fold(park.city)
    .split(' ')
    .filter((word) => word.length >= 5 && !STOP.has(word))
  return [...new Set([...(extra[park.id] ?? []), ...fromTitle, ...fromCity])]
}

function filenameOf(url) {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '')
  } catch {
    return url
  }
}

function keepImage(park, url) {
  const name = fold(filenameOf(url))
  if (
    name.includes('harita') ||
    name.includes('map') ||
    name.includes('location') ||
    name.includes('wappen') ||
    name.includes('noten') ||
    name.includes('museum') ||
    name.includes('statuette') ||
    name.includes('district') ||
    name.includes('valisi') ||
    name.includes('belediye') ||
    name.includes('heykel') ||
    name.includes('at arabasi') ||
    name.includes('bahce demiri') ||
    name.includes('wounded') ||
    name.includes('moth') ||
    name.includes('succulent') ||
    name.includes('water drop')
  ) {
    return false
  }
  if (park.id === 'isparta-golcuk' && name.includes('bolu')) return false
  if (park.id === 'dilburnu' && name.includes('buyukada')) return false
  if (park.id === 'dumanli-tp' && (name.includes('kars') || name.includes('ruzgar'))) return false
  if (park.id === 'kayalidere' && (name.includes('mus') || name.includes('urartu') || name.includes('anatolian'))) return false
  if (park.id === 'geben-vadisi' && !name.includes('andirin') && !name.includes('geben vadisi') && !name.includes('kahramanmaras')) {
    return false
  }
  const tokens = tokensFor(park)
  return tokens.some((token) => name.includes(fold(token)))
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function skipTitle(title) {
  const t = title.toLowerCase()
  return (
    t.includes('map') ||
    t.includes('harita') ||
    t.includes('diagram') ||
    t.includes('logo') ||
    t.includes('flag') ||
    t.includes('icon') ||
    t.includes('svg') ||
    t.includes('satellite')
  )
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

async function fileUrls(titles) {
  if (titles.length === 0) return []
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
    '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1400&titles=' +
    titles.map((title) => encodeURIComponent(title)).join('|')
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return []
  const data = await res.json()
  const pages = data.query?.pages ? Object.values(data.query.pages) : []
  const images = []
  for (const page of pages) {
    if (page.missing || skipTitle(String(page.title || ''))) continue
    const info = page.imageinfo?.[0]
    if (!info) continue
    if (!String(info.mime || '').startsWith('image/') || String(info.mime).includes('svg')) continue
    const src = info.thumburl || info.url
    if (src && src.startsWith('https://')) images.push(cleanUrl(src))
  }
  return images
}

async function commonsSearch(query) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
    '&list=search&srnamespace=6&srlimit=10&srsearch=' +
    encodeURIComponent(`"${query}"`)
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return []
  const data = await res.json()
  const titles = (data.query?.search ?? []).map((row) => row.title).filter((title) => !skipTitle(title))
  return fileUrls(titles)
}

for (const park of catalog) {
  park.images = [...new Set(park.images.map(cleanUrl))].filter((url) => keepImage(park, url))
}

const NEED = catalog.filter((park) => park.images.length < 3)
for (const park of NEED) {
  process.stdout.write(`retry ${park.id} (${park.images.length})\n`)
  const queries = [park.title, park.wiki].filter(Boolean)
  if (park.city) queries.push(`${park.title.split(' ')[0]} ${park.city}`)
  try {
    for (const query of queries) {
      const extra = await commonsSearch(query)
      for (const url of extra) {
        if (keepImage(park, url) && !park.images.includes(url)) park.images.push(url)
        if (park.images.length >= 3) break
      }
      if (park.images.length >= 3) break
      await sleep(160)
    }
  } catch (error) {
    process.stdout.write(`  fail ${error instanceof Error ? error.message : error}\n`)
  }
  park.images = park.images.slice(0, 3)
  process.stdout.write(`  -> ${park.images.length}\n`)
  await sleep(160)
}

const json = `${JSON.stringify(catalog, null, 2)}\n`
writeFileSync(path, json)
writeFileSync(join(root, 'public/data/catalog.json'), json)
const with3 = catalog.filter((item) => item.images.length >= 3).length
const withAny = catalog.filter((item) => item.images.length > 0).length
console.log(`kept >=3 ${with3}; any ${withAny}; none ${catalog.length - withAny}`)
for (const park of catalog.filter((item) => item.images.length === 0)) console.log('none', park.title)
for (const park of catalog.filter((item) => item.images.length > 0 && item.images.length < 3)) {
  console.log('few', park.id, park.images.map(filenameOf).join(' | '))
}
