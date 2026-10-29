import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(readFileSync(join(root, 'src/data/catalog.json'), 'utf8'))
const UA = 'YuruyomAdim5/1.0 (https://github.com/aliselimnurdogan/Y-R-YOM; educational camp guide)'
const API = 'https://commons.wikimedia.org/w/api.php'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shortName(title) {
  return title
    .replace(/ Tabiat Parkı$/i, '')
    .replace(/ Milli Parkı$/i, '')
    .replace(/ Tabiatı Koruma Alanı$/i, '')
    .trim()
}

function tokens(title) {
  return shortName(title)
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[^a-z0-9]+/i)
    .filter((part) => part.length >= 4)
}

async function wiki(params) {
  const url = new URL(API)
  url.search = new URLSearchParams({ format: 'json', origin: '*', ...params }).toString()
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`commons ${res.status}`)
  return res.json()
}

function blobOf(info) {
  return `${info.title || ''} ${JSON.stringify(info.extmetadata || {})}`.toLowerCase()
}

function nameHits(info, place) {
  const blob = blobOf(info).replace(/ı/g, 'i').normalize('NFD').replace(/\p{M}/gu, '')
  const bits = tokens(place.title)
  if (bits.length === 0) return 0
  return bits.filter((bit) => blob.includes(bit)).length
}

function scoreFile(info, place, distM) {
  if (!info) return -1
  const mime = String(info.mime || '')
  if (!mime.startsWith('image/') || mime.includes('svg')) return -1
  const w = Number(info.width) || 0
  const h = Number(info.height) || 0
  if (w < 1400 || h < 500) return -1
  const blob = blobOf(info)
  if (/\b(logo|icon|flag|coa|coat of|diagram|svg|map of turkey)\b/i.test(blob) && !/panorama|360/.test(blob)) {
    return -1
  }
  const hits = nameHits(info, place)
  const near = typeof distM === 'number' && distM < 4000
  if (hits === 0 && !near) return -1
  const ratio = w / h
  let score = hits * 20
  if (near) score += Math.max(0, 18 - distM / 300)
  if (/\b360\b|equirectangular|spherical panorama|photo.?sphere/i.test(blob)) score += 40
  if (/panorama|pano\b/i.test(blob)) score += 18
  if (ratio >= 1.9 && ratio <= 2.15) score += 30
  else if (ratio >= 2.15) score += 20
  else if (ratio >= 1.6) score += 6
  if (w >= 3500) score += 6
  return score
}

function pickUrl(info) {
  if (typeof info.thumburl === 'string' && info.thumburl.startsWith('https://')) {
    return info.thumburl.replace(/\/(\d+)px-/, '/2560px-')
  }
  if (typeof info.url === 'string') return info.url
  return null
}

function kindOf(info) {
  const w = Number(info.width) || 1
  const h = Number(info.height) || 1
  const ratio = w / h
  const blob = blobOf(info)
  if ((ratio >= 1.9 && ratio <= 2.15) || /\b360\b|equirectangular|spherical panorama/.test(blob)) return '360'
  if (ratio >= 2 || /panorama/.test(blob)) return 'pano'
  return 'view'
}

async function searchText(place, extra) {
  const name = shortName(place.title)
  const query = extra ? `${name} ${extra}` : `"${name}"`
  const data = await wiki({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: '10',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '2560',
  })
  return Object.values(data.query?.pages || {}).map((page) => {
    const info = page.imageinfo?.[0]
    if (info) info.title = page.title
    return { info, distM: null }
  })
}

async function searchGeo(place) {
  const data = await wiki({
    action: 'query',
    list: 'geosearch',
    gscoord: `${place.lat}|${place.lng}`,
    gsradius: '5000',
    gsnamespace: '6',
    gslimit: '12',
  })
  const hits = data.query?.geosearch || []
  if (hits.length === 0) return []
  const info = await wiki({
    action: 'query',
    titles: hits.map((hit) => hit.title).join('|'),
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '2560',
  })
  const distByTitle = Object.fromEntries(hits.map((hit) => [hit.title, hit.dist]))
  return Object.values(info.query?.pages || {}).map((page) => {
    const image = page.imageinfo?.[0]
    if (image) image.title = page.title
    return { info: image, distM: distByTitle[page.title] ?? null }
  })
}

function bestOf(rows, place) {
  let winner = null
  let best = 12
  for (const row of rows) {
    const score = scoreFile(row.info, place, row.distM)
    if (score > best) {
      best = score
      winner = { ...row, score }
    }
  }
  return winner
}

const results = {}
let found = 0
for (const place of catalog) {
  try {
    const panoPages = await searchText(place, 'panorama')
    await sleep(140)
    const spinPages = await searchText(place, '360')
    await sleep(140)
    const namePages = await searchText(place, '')
    await sleep(140)
    const geoPages = await searchGeo(place)
    await sleep(140)
    const pick = bestOf([...panoPages, ...spinPages, ...namePages, ...geoPages], place)
    if (pick?.info) {
      const url = pickUrl(pick.info)
      if (url) {
        results[place.id] = {
          url,
          preview: pick.info.thumburl || url,
          credit: 'Wikimedia Commons',
          kind: kindOf(pick.info),
          file: pick.info.title,
          score: pick.score,
          width: pick.info.width,
          height: pick.info.height,
        }
        found += 1
        console.log('OK', place.id, results[place.id].kind, pick.score, pick.info.title)
        continue
      }
    }
    console.log('--', place.id)
  } catch (error) {
    console.log('ERR', place.id, error.message)
    await sleep(700)
  }
}

writeFileSync(join(root, 'scripts/adim5-panos.json'), JSON.stringify({ found, total: catalog.length, results }, null, 2))
console.log(`done ${found}/${catalog.length}`)
