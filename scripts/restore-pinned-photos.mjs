import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src/data/catalog.json')
const UA = 'YuruyomKampRehberi/3.0 (https://github.com/aliselimnurdogan/Y-R-YOM; educational catalog)'
const catalog = JSON.parse(readFileSync(path, 'utf8'))

const PINNED = {
  'yedigoller-mp': [
    'File:TR Yedigöller asv2021-10 img16.jpg',
    'File:Yedigöller Yansıma.jpg',
    'File:Waterfall in Yedigöller National Park.jpg',
  ],
  'abant-mp': [
    'File:Abant Gölü - 2024 Ocak.jpg',
    'File:Bolu Abant Gölü Tabiat Parkı.jpg',
    'File:Abant lake snowy.jpg',
  ],
  'salda-golu-tp': [
    'File:Salda Gölü Türkiye 2022.jpg',
    'File:Lake Salda (Salda Gölü).jpg',
    'File:Lake Salda Nature Park 1.jpg',
  ],
  'uzungol-tp': [
    'File:Uzungöl lake and town.jpg',
    'File:Uzungöl, Trabzon 2014.jpg',
    'File:Uzungöl 112020.jpg',
  ],
  'polonezkoy-tp': [
    'File:Polonezköy nature panorama.jpg',
    'File:Polenezköy Tabiat Parkı, İstanbul, EOS 60D.jpg',
    'File:Polonezköy tabiat parkı yürüyüş yolu 09.jpg',
  ],
  'spil-dagi-mp': [
    'File:Mount Sipylus Manisa Turkey Atalani Lake.jpg',
    'File:Spil Dağı (20220803).jpg',
    'File:Spil Dağı Zirvesi.jpg',
  ],
  'bafa-golu-tp': [
    'File:Bafa Gölü Tabiat Parkı (bilgekorkmaz).jpg',
    'File:Bafa lake1.JPG',
    'File:Bafa Lake.jpg',
  ],
  'kursunlu-selalesi': [
    'File:Kurşunlu Şelalesi Manzara Fotoğrafı.jpg',
    'File:Kurşunlu Şelalesi Tabiat Parkı.jpg',
    'File:Kurşunlu Şelalesi - Şelalesi Bölgesi - Manzara Fotoğrafı.jpg',
  ],
  'soguksu': [
    'File:Soğuksu Milli Parkı.jpg',
    'File:Mountains of Soğuksu Milli Parkı.jpg',
    'File:TR Kızılcahamam asv2021-10 img01.jpg',
  ],
  'uludag-sarialan': [
    'File:Uludağ Sarıalan view.jpg',
    'File:Uludağ Sarıalan region.jpg',
    'File:View of Uludağ from Sarıalan.JPG',
  ],
  'karagol-sahara': [
    'File:Karagöl in Şavşat 10.jpg',
    'File:Karagöl-Sahara National Park.jpg',
    'File:Karagöl Sahara Milli Parkı.jpg',
  ],
  'ayvalik-adalari': [
    'File:Ayvalık Islands Nature Park.jpg',
    'File:Ayvalık Islands.jpg',
    "File:Şeytan Sofrası'ndan Günbatımında Ayvalık Adaları Milli Parkı Görünümü.jpg",
  ],
  'goynuk-comaklar': [
    'File:Göynük Kanyonu.jpg',
    'File:2019 Göynük Canyon 1.jpg',
    'File:Göynük Kanyon Kemer Antalya Turkey.jpg',
  ],
  'limni-golu': [
    'File:Limni Gölü Tabiat Parkı - Ağustos 2014 IMG 8923 hamdigumus.jpg',
    'File:Lake Limni aerial view 02.jpg',
    'File:Limni Gölü 2014-1.jpg',
  ],
  'artabel': [
    'File:Artabel Gölleri... - panoramio.jpg',
    'File:Artabel Dağları... - panoramio.jpg',
    'File:Artabel Şelalesi... - panoramio.jpg',
  ],
  poyrazlar: [
    'File:Poyrazlar Gölü.jpg',
    'File:Poyrazlar Lake.jpg',
    'File:Poyrazlar Gölü Tabiat Parkı.jpg',
  ],
}

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

async function fileUrls(titles) {
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
    if (page.missing) continue
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
    '&list=search&srnamespace=6&srlimit=8&srsearch=' +
    encodeURIComponent(query)
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return []
  const data = await res.json()
  const titles = (data.query?.search ?? []).map((row) => row.title)
  return fileUrls(titles)
}

function fold(value) {
  return value
    .toLocaleLowerCase('tr')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
}

for (const park of catalog) {
  const pinned = PINNED[park.id]
  if (!pinned) continue
  const urls = await fileUrls(pinned)
  if (urls.length > 0) park.images = urls.slice(0, 3)
  process.stdout.write(`pin ${park.id} -> ${park.images.length}\n`)
  await sleep(120)
}

const extraQueries = {
  poyrazlar: ['Poyrazlar Gölü Tabiat Parkı', 'Poyrazlar Gölü Sakarya'],
  'hacet-deresi': ['Hacet Deresi Tabiat Parkı', 'Hacet Deresi Şile'],
  'buyukada-tp': ['Büyükada Tabiat Parkı'],
  dilburnu: ['Dilburnu Tabiat Parkı Heybeliada'],
}

for (const park of catalog) {
  if (park.images.length >= 3) continue
  const queries = extraQueries[park.id]
  if (!queries) continue
  for (const query of queries) {
    const extra = await commonsSearch(query)
    const needle = fold(park.title.split(' ')[0])
    for (const url of extra) {
      if (fold(url).includes(needle) || fold(decodeURIComponent(url)).includes(needle)) {
        if (!park.images.includes(url)) park.images.push(url)
      }
    }
    if (park.images.length >= 3) break
    await sleep(160)
  }
  park.images = park.images.slice(0, 3)
  process.stdout.write(`extra ${park.id} -> ${park.images.length}\n`)
}

const json = `${JSON.stringify(catalog, null, 2)}\n`
writeFileSync(path, json)
writeFileSync(join(root, 'public/data/catalog.json'), json)
console.log(
  '>=3',
  catalog.filter((item) => item.images.length >= 3).length,
  'any',
  catalog.filter((item) => item.images.length > 0).length,
)
