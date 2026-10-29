import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = join(root, 'src/data/catalog.json')
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'))
const UA = 'YuruyomAdim5/1.0 (https://github.com/aliselimnurdogan/Y-R-YOM)'
const API = 'https://commons.wikimedia.org/w/api.php'
const missing = catalog.filter((place) => !place.pano)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fold(text) {
  return String(text)
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function tokens(title) {
  return fold(title)
    .replace(/ tabiat parki$/, '')
    .replace(/ milli parki$/, '')
    .split(/[^a-z0-9]+/i)
    .filter((part) => part.length >= 4)
}

function shortName(title) {
  return title.replace(/ Tabiat Parkı$/i, '').replace(/ Milli Parkı$/i, '').trim()
}

async function wiki(params) {
  const url = new URL(API)
  url.search = new URLSearchParams({ format: 'json', origin: '*', ...params }).toString()
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

function thumb(info) {
  if (typeof info.thumburl === 'string') return info.thumburl.replace(/\/(\d+)px-/, '/2560px-')
  return info.url
}

let added = 0
for (const place of missing) {
  try {
    const data = await wiki({
      action: 'query',
      generator: 'search',
      gsrsearch: `"${shortName(place.title)}"`,
      gsrnamespace: '6',
      gsrlimit: '8',
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata',
      iiurlwidth: '1920',
    })
    const bits = tokens(place.title)
    let pick = null
    for (const page of Object.values(data.query?.pages || {})) {
      const info = page.imageinfo?.[0]
      if (!info || !String(info.mime || '').startsWith('image/')) continue
      if ((info.width || 0) < 1000) continue
      const blob = fold(`${page.title} ${JSON.stringify(info.extmetadata || {})}`)
      if (/iss\d|view of earth|svg|logo|icon|map of/.test(blob)) continue
      if (!bits.some((bit) => blob.includes(bit))) continue
      pick = { title: page.title, ...info }
      break
    }
    if (pick) {
      place.pano = {
        url: thumb(pick),
        preview: pick.thumburl || thumb(pick),
        credit: 'Wikimedia Commons',
        kind: 'view',
        width: pick.width,
        height: pick.height,
      }
      if (!place.images?.length) place.images = [pick.thumburl || thumb(pick)]
      added += 1
      console.log('OK', place.id, pick.title)
    } else {
      console.log('--', place.id)
    }
  } catch (error) {
    console.log('ERR', place.id, error.message)
  }
  await sleep(200)
}

writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`)
writeFileSync(join(root, 'public/data/catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`)
const withPano = catalog.filter((place) => place.pano).length
console.log({ added, withPano, total: catalog.length, still: catalog.filter((p) => !p.pano).map((p) => p.id) })
