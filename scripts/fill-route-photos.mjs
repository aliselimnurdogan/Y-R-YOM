import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src/data/routes.json')
const catalog = JSON.parse(readFileSync(join(root, 'src/data/catalog.json'), 'utf8'))
const routes = JSON.parse(readFileSync(path, 'utf8'))
const UA = 'YuruyomParkur/10.0 (https://github.com/aliselimnurdogan/Y-R-YOM; educational hiking catalog)'

const CATALOG_MAP = {
  'yedigoller-gol-turu': 'yedigoller-mp',
  'yedigoller-kamp-yuruyusu': 'yedigoller-mp',
  'abant-golu-mtb': 'abant-mp',
  'abant-kamp-yuruyusu': 'abant-mp',
  'spil-dagi-mtb': 'spil-dagi-mp',
}

const EXTRA = {
  'likya-oludeniz-faralya': ['Ölüdeniz Fethiye', 'Oludeniz beach Turkey', 'Faralya Butterfly Valley'],
  'kapadokya-vadiler-dongusu': ['Göreme Cappadocia valley', 'Goreme Fairy Chimneys'],
  'uludag-zirve-yuruyusu': ['Uludağ Bursa summit', 'Uludag mountain Turkey'],
  'kackar-yayla-yuruyusu': ['Kaçkar Yaylaları Çamlıhemşin', 'Kackar mountains Rize'],
  'belgrad-ormani-kosu': ['Belgrad Forest Istanbul', 'Belgrad Ormanı Sarıyer'],
  'buyukada-bisiklet-turu': ['Büyükada Istanbul', 'Buyukada Princes Islands'],
  'yedigoller-gol-turu': ['Yedigöller Milli Parkı', 'Yedigoller National Park'],
  'abant-golu-mtb': ['Abant Gölü Bolu', 'Lake Abant Turkey'],
  'cirali-olimpos': ['Çıralı Olympos beach', 'Olympos Antalya'],
  'saklikent-kanyon-girisi': ['Saklıkent Canyon Fethiye', 'Saklikent kanyon'],
  'koprulu-kanyon-kayak': ['Köprülü Kanyon Antalya', 'Koprulu Canyon'],
  'uzungol-cevre-yuruyusu': ['Uzungöl Trabzon', 'Uzungol lake'],
  'sumela-altindere': ['Sümela Monastery', 'Sumela Altındere'],
  'efes-antik-kent': ['Ephesus Selçuk', 'Efes antik kent'],
  'pamukkale-traverten': ['Pamukkale travertine', 'Pamukkale Denizli'],
  'nemrut-yaklasim': ['Nemrut Dağı Kahta', 'Mount Nemrut statues'],
  'erciyes-etek-yuruyusu': ['Erciyes Dağı Kayseri', 'Mount Erciyes'],
  'spil-dagi-mtb': ['Spil Dağı Manisa', 'Mount Sipylus'],
  'ballikayalar-kanyon': ['Ballıkayalar Gebze', 'Ballikayalar Kocaeli'],
  'polonezkoy-kosu': ['Polonezköy Istanbul', 'Polonezkoy Beykoz'],
  'kazdaglari-yuruyusu': ['Kazdağları Edremit', 'Mount Ida Turkey Kazdag'],
  'aladaglar-demirkazik-yaklasim': ['Aladağlar Demirkazık', 'Aladaglar Nigde'],
  'sapanca-gol-kosu': ['Sapanca Gölü', 'Lake Sapanca'],
  'van-kalesi-yuruyusu': ['Van Kalesi', 'Van Castle Turkey'],
  'ilgaz-yuruyusu': ['Ilgaz Dağı', 'Ilgaz mountain Kastamonu'],
  'oludeniz-kiyi-kayak': ['Ölüdeniz lagoon', 'Oludeniz Fethiye'],
  'yedigoller-kamp-yuruyusu': ['Yedigöller Milli Parkı', 'Yedigoller National Park'],
  'beypazari-sirti': ['Beypazarı Ankara', 'Beypazari houses'],
  'belgrad-orman-yolu': ['Belgrad Forest Istanbul', 'Belgrad Ormanı'],
  'goreme-acik-hava-muzesi': ['Göreme Open Air Museum', 'Goreme Open Air Museum'],
  'uludag-etek-kosu': ['Uludağ Bursa', 'Uludag mountain'],
  'trabzon-sahil-bisiklet': ['Trabzon sahil', 'Trabzon waterfront'],
  'abant-kamp-yuruyusu': ['Abant Gölü Bolu', 'Lake Abant'],
  'goreme-vadisi-mtb': ['Göreme valley Cappadocia', 'Goreme landscape'],
  'baskonus-yaylasi': ['Başkonuş Yaylası Kahramanmaraş', 'Baskonus Yaylasi'],
  'yavsan-yaylasi': ['Yavşan Yaylası Kahramanmaraş', 'Yavsan Yaylasi'],
  'kapicam-tabiat-parki': ['Kapıçam Tabiat Parkı', 'Kapicam Kahramanmaras'],
  'tekir-yaylasi': ['Tekir Yaylası Kahramanmaraş', 'Tekir Yaylasi'],
  'yesilgoz-mesire': ['Yeşilgöz Kahramanmaraş', 'Yesilgoz'],
  'berit-dagi': ['Berit Dağı Göksun', 'Berit Dagi Kahramanmaras'],
  'ali-kayasi-menzelet': ['Ali Kayası Menzelet', 'Menzelet barajı'],
  'dongel-magarasi': ['Döngel Mağarası Kahramanmaraş', 'Dongel Magarasi'],
  'engizek-dagi': ['Engizek Dağı', 'Engizek Dagi'],
  'cokak-geben-orman': ['Geben Andırın', 'Çokak Yaylası'],
  'ahir-dagi-etek': ['Ahır Dağı Kahramanmaraş', 'Ahir Dagi'],
  'binboga-keklikoluk': ['Binboğa Göksun', 'Binboga mountains'],
  'nurhak-dagi': ['Nurhak Dağı', 'Nurhak Dagi'],
  'hartlap-orman': ['Hartlap Kahramanmaraş', 'Hartlap orman'],
  'yedikuyular': ['Yedikuyular Kahramanmaraş', 'Yedikuyular ski'],
  'halbur-yaylasi': ['Halbur Yaylası Andırın', 'Halbur Yaylasi'],
  'kirksu-yaylasi': ['Kırksu Yaylası Andırın', 'Kirksu Yaylasi'],
  'karagol-degirmendere': ['Karagöl Göksun', 'Degirmendere Karagol Kahramanmaras'],
}

const STOP = new Set([
  'yolu',
  'turu',
  'yuruyusu',
  'yuruyus',
  'mtb',
  'kano',
  'bisiklet',
  'kosu',
  'yaklasimi',
  'girisi',
  'cevre',
  'etek',
  'kamp',
  'halkasi',
  'inisi',
  'dagi',
  'dag',
  'golu',
  'gol',
  'vadisi',
  'vadi',
  'yaylasi',
  'yayla',
  'tabiat',
  'parki',
  'park',
  'acik',
  'hava',
  'muzesi',
  'kiyi',
  'ormani',
  'orman',
  'sirti',
  'sirt',
  'magarasi',
  'magara',
  'mesire',
  'alani',
  'cevresi',
  'olimpos',
  'manzara',
])

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fold(value) {
  return value
    .toLocaleLowerCase('tr')
    .replaceAll('ı', 'i')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function tokensOf(route) {
  const words = fold(`${route.title} ${route.city} ${route.region}`)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4 && !STOP.has(word))
  return [...new Set(words)]
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
    t.includes('.svg') ||
    t.includes('portrait') ||
    t.includes('selfie')
  )
}

function matchesTokens(fileTitle, tokens) {
  const t = fold(fileTitle)
  return tokens.some((token) => token.length >= 4 && t.includes(token))
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
    if (!matchesTokens(String(page.title || ''), tokens)) continue
    const info = page.imageinfo?.[0]
    if (!info) continue
    if (!String(info.mime || '').startsWith('image/') || String(info.mime).includes('svg')) continue
    if ((info.size || 0) < 40000 && !(info.thumburl || info.url)) continue
    const src = info.thumburl || info.url
    if (src && src.startsWith('https://') && /wikimedia|wikipedia/.test(src)) images.push(cleanUrl(src))
  }
  return images
}

async function commonsSearch(query, tokens) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
    '&list=search&srnamespace=6&srlimit=10&srsearch=' +
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
    '&prop=pageimages|images&piprop=original|name&imlimit=20&titles=' +
    encodeURIComponent(title)
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
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

function catalogPhoto(id) {
  const parkId = CATALOG_MAP[id]
  if (!parkId) return ''
  const park = catalog.find((item) => item.id === parkId)
  return park?.images?.[0] || ''
}

let foundCount = 0
for (const route of routes) {
  const tokens = tokensOf(route)
  let image = catalogPhoto(route.id)
  if (!image) {
    const queries = EXTRA[route.id] ?? [route.title, `${route.city} ${route.region}`]
    try {
      for (const query of queries) {
        const hits = await commonsSearch(query, tokens)
        if (hits[0]) {
          image = hits[0]
          break
        }
        await sleep(160)
      }
      if (!image) {
        const wiki = await wikiFiles(route.title.replace(/:.*/, '').trim(), tokens)
        if (wiki[0]) image = wiki[0]
      }
    } catch (error) {
      process.stdout.write(`fail ${route.id} ${error instanceof Error ? error.message : error}\n`)
    }
  }
  route.image = image || ''
  if (image) foundCount += 1
  process.stdout.write(`${image ? 'ok  ' : 'yok '} ${route.id}\n`)
  await sleep(140)
}

const json = `${JSON.stringify(routes, null, 2)}\n`
writeFileSync(path, json)
writeFileSync(join(root, 'public/data/routes.json'), json)
console.log(`photos ${foundCount}/${routes.length}`)
const missing = routes.filter((item) => !item.image).map((item) => item.id)
if (missing.length) console.log(`none:\n${missing.join('\n')}`)
