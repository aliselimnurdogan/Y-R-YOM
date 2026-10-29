import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = join(root, 'src/data/catalog.json')
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'))
const found = JSON.parse(readFileSync(join(root, 'scripts/adim5-panos.json'), 'utf8'))

function tokens(title) {
  return String(title)
    .replace(/ Tabiat Parkı$/i, '')
    .replace(/ Milli Parkı$/i, '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[^a-z0-9]+/i)
    .filter((part) => part.length >= 4)
}

function fold(text) {
  return String(text)
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function bigger(url) {
  return String(url).replace(/\/(\d+)px-/, '/2560px-')
}

function kindFrom(entry) {
  const file = fold(entry.file || '')
  const ratio = entry.width && entry.height ? entry.width / entry.height : 0
  if (/\b360\b|equirectangular|spherical|panosphere/.test(file)) return '360'
  if (ratio >= 2.2 || /panorama|panoramik/.test(file)) return 'pano'
  return 'view'
}

function isJunk(entry) {
  const blob = fold(`${entry.file || ''} ${entry.url || ''}`)
  return /iss\d|view of earth|hyacinthus|isin karaca|isın karaca|te&ii vol/.test(blob)
}

function cityClash(place, entry) {
  const blob = fold(`${entry.file || ''} ${entry.url || ''}`)
  const home = fold(`${place.title} ${place.city} ${place.region}`)
  for (const city of ['bolu', 'istanbul', 'ankara', 'izmir', 'antalya', 'bursa', 'trabzon']) {
    if (blob.includes(city) && !home.includes(city)) return true
  }
  return false
}

function matchesPlace(place, entry) {
  if (isJunk(entry) || cityClash(place, entry)) return false
  const bits = tokens(place.title)
  const blob = fold(`${entry.file || ''} ${entry.url || ''}`)
  if (bits.length === 0) return false
  return bits.some((bit) => blob.includes(bit))
}

let matched = 0
let fallback = 0
let spin = 0
for (const place of catalog) {
  const hit = found.results?.[place.id]
  if (hit && matchesPlace(place, hit)) {
    const kind = kindFrom(hit)
    place.pano = {
      url: bigger(hit.url),
      preview: hit.preview || hit.url,
      credit: 'Wikimedia Commons',
      kind,
      width: hit.width,
      height: hit.height,
    }
    matched += 1
    if (kind === '360') spin += 1
    continue
  }
  if (place.images?.[0]) {
    place.pano = {
      url: bigger(place.images[0]),
      preview: place.images[0],
      credit: 'Wikimedia Commons',
      kind: 'view',
    }
    fallback += 1
  }
}

const withPano = catalog.filter((place) => place.pano).length
writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`)
writeFileSync(join(root, 'public/data/catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`)
console.log({ matched, fallback, spin, withPano, total: catalog.length, missing: catalog.filter((p) => !p.pano).map((p) => p.id) })
