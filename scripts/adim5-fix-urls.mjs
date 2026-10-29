import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

function toThumb1920(url) {
  let next = String(url).replace(/\?.*$/, '')
  next = next.replace('https://thumb.wikimedia.org/', 'https://upload.wikimedia.org/')
  if (next.includes('/thumb/') && /\/\d+px-/.test(next)) {
    return next.replace(/\/\d+px-/, '/1920px-')
  }
  const match = next.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/([0-9a-f])\/([0-9a-f]{2})\/(.+)$/i)
  if (match && !next.includes('/thumb/')) {
    return `${match[1]}/thumb/${match[2]}/${match[3]}/${match[4]}/1920px-${match[4]}`
  }
  return next
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = join(root, 'src/data/catalog.json')
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'))
let n = 0
for (const place of catalog) {
  if (!place.pano) continue
  place.pano.url = toThumb1920(place.pano.url)
  if (place.pano.preview) place.pano.preview = toThumb1920(place.pano.preview)
  n += 1
}
writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`)
writeFileSync(join(root, 'public/data/catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`)
const sample = catalog.find((place) => place.id === 'yedigoller-mp')
console.log('fixed', n, sample.pano.url)
