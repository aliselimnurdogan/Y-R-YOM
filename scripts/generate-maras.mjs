/**
 * Append original Kahramanmaraş GPS routes onto public/data/routes.json.
 * Spines come from scripts/maras-research.json; photos from maras-images.json.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const research = JSON.parse(readFileSync(join(root, 'scripts', 'maras-research.json'), 'utf8'))
const images = JSON.parse(readFileSync(join(root, 'scripts', 'maras-images.json'), 'utf8'))
const existing = JSON.parse(readFileSync(join(root, 'public', 'data', 'routes.json'), 'utf8'))

const AUTHORS = [
  'Leyla Bozkurt',
  'Ömer Faruk Kaya',
  'Hatice Yurtseven',
  'Mehmet Ali Gündüz',
  'Şule Karataş',
  'Fatih Özkan',
  'Nurcan Demirel',
  'İsmail Çelikbaş',
  'Gülşah Yaman',
  'Ramazan Akın',
  'Tuğba Sarı',
  'Adem Korkmaz',
  'Sevgi Arıkan',
  'Halis Doğanay',
  'Merve Ünal',
  'Bekir Soylu',
  'Esra Tan',
  'Cihan Avcı',
  'Dilek Coşkun',
  'Yunus Emre Aslan',
]

const DATES = [
  '2024-06-14',
  '2025-05-03',
  '2024-09-21',
  '2023-08-11',
  '2025-07-19',
  '2024-04-27',
  '2023-10-08',
  '2025-06-02',
  '2024-07-30',
  '2023-09-16',
  '2025-04-18',
  '2024-08-09',
  '2023-07-22',
  '2025-09-01',
  '2024-05-28',
  '2023-06-15',
  '2025-08-12',
  '2024-10-05',
]

const RATINGS = [
  [4.8, 312],
  [4.7, 268],
  [4.6, 194],
  [4.9, 421],
  [4.5, 157],
  [4.8, 203],
  [4.4, 88],
  [4.6, 141],
  [4.7, 176],
  [4.5, 119],
  [4.8, 233],
  [4.3, 64],
  [4.6, 97],
  [4.4, 73],
  [4.9, 288],
  [4.7, 154],
  [4.5, 81],
  [4.8, 190],
]

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)))
}

function sampleSpine(spine, t) {
  const cum = [0]
  for (let i = 1; i < spine.length; i++) {
    cum.push(cum[i - 1] + haversineKm(spine[i - 1][0], spine[i - 1][1], spine[i][0], spine[i][1]))
  }
  const total = cum[cum.length - 1]
  const dist = Math.min(total, Math.max(0, t * total))
  let seg = 1
  while (seg < spine.length - 1 && cum[seg] < dist) seg += 1
  const segLen = cum[seg] - cum[seg - 1]
  const u = segLen === 0 ? 0 : (dist - cum[seg - 1]) / segLen
  const uC = Math.min(1, Math.max(0, u))
  const a = spine[seg - 1]
  const b = spine[seg]
  const ease = (1 - Math.cos(Math.PI * uC)) / 2
  return {
    lat: a[0] + (b[0] - a[0]) * uC,
    lng: a[1] + (b[1] - a[1]) * uC,
    ele: a[2] + (b[2] - a[2]) * ease,
  }
}

function buildTrack(spineIn, { loop, seed }) {
  const rng = mulberry32(seed)
  let spine = spineIn.map((p) => [p[0], p[1], p[2]])
  if (loop) {
    const first = spine[0]
    const last = spine[spine.length - 1]
    if (haversineKm(first[0], first[1], last[0], last[1]) > 0.02) {
      spine = [...spine, [first[0], first[1], first[2]]]
    }
  }

  const n = 62 + Math.floor(rng() * 19)
  const wobbleAmp = 0.00008 + rng() * 0.00007
  const waves = 2 + rng() * 2
  const phase = rng() * Math.PI * 2
  const minSpineEle = Math.min(...spine.map((p) => p[2]))
  const eleAmp = minSpineEle < 2 ? 4 + rng() * 2 : 4 + rng() * 8

  const raw = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const p = sampleSpine(spine, t)
    const noise =
      eleAmp * (0.75 * Math.sin(2 * Math.PI * t) + 0.25 * Math.sin(4 * Math.PI * t + phase * 0.2))
    let ele = p.ele + noise
    if (ele < 0) ele = 0
    raw.push([p.lat, p.lng, ele])
  }

  for (let i = 1; i < n - 1; i++) {
    const t = i / (n - 1)
    const prev = raw[i - 1]
    const next = raw[i + 1]
    const dLat = next[0] - prev[0]
    const dLng = next[1] - prev[1]
    const norm = Math.hypot(dLat, dLng) || 1
    const px = -dLng / norm
    const py = dLat / norm
    const envelope = Math.sin(Math.PI * t)
    const wob = wobbleAmp * envelope * Math.sin(phase + t * Math.PI * waves)
    raw[i][0] += px * wob
    raw[i][1] += py * wob
  }

  for (let i = 1; i < raw.length - 1; i++) {
    if (raw[i][2] < 0) raw[i][2] = 0
    const floor = Math.min(raw[i - 1][2], raw[i + 1][2]) - 12
    if (raw[i][2] < floor) raw[i][2] = Math.max(0, floor)
  }

  const track = raw.map(([lat, lng, ele]) => [
    Math.round(lat * 1e6) / 1e6,
    Math.round(lng * 1e6) / 1e6,
    Math.round(ele * 10) / 10,
  ])

  if (loop) track[track.length - 1] = [track[0][0], track[0][1], track[0][2]]
  return track
}

function trackStats(track) {
  let dist = 0
  let gain = 0
  let loss = 0
  let maxE = -Infinity
  let minE = Infinity
  for (let i = 0; i < track.length; i++) {
    const ele = track[i][2]
    if (ele > maxE) maxE = ele
    if (ele < minE) minE = ele
    if (i === 0) continue
    dist += haversineKm(track[i - 1][0], track[i - 1][1], track[i][0], track[i][1])
    const delta = ele - track[i - 1][2]
    if (delta > 0) gain += delta
    else loss -= delta
  }
  return { dist, gain, loss, maxE, minE }
}

function difficultyOf(gain, distanceKm) {
  if (gain < 300 && distanceKm < 10) return 'Kolay'
  if (gain < 800) return 'Orta'
  if (gain < 1500) return 'Zor'
  return 'Çok zor'
}

function durationMin(activity, distanceKm, gain) {
  let min
  if (activity === 'hiking' || activity === 'camping') min = distanceKm * 14 + gain / 10
  else if (activity === 'running') min = distanceKm * 6
  else if (activity === 'mtb' || activity === 'cycling') min = distanceKm * 5 + gain / 20
  else if (activity === 'kayak') min = distanceKm * 8
  else throw new Error(`Unknown activity ${activity}`)
  return Math.max(1, Math.round(min))
}

function notableIndex(track) {
  const lo = Math.floor(track.length * 0.32)
  const hi = Math.floor(track.length * 0.68)
  let best = Math.floor(track.length / 2)
  let bestEle = -Infinity
  for (let i = lo; i <= hi; i++) {
    if (track[i][2] > bestEle) {
      bestEle = track[i][2]
      best = i
    }
  }
  return best
}

const photosByMood = {
  tent: [],
  'cedar forest': [],
  plateau: [],
  lake: [],
  ridge: [],
}
for (const photo of images.photos) {
  if (photo.ok && photosByMood[photo.mood]) photosByMood[photo.mood].push(photo)
}

const MOOD_FOR = {
  'baskonus-yaylasi': 'tent',
  'yavsan-yaylasi': 'cedar forest',
  'kapicam-tabiat-parki': 'cedar forest',
  'tekir-yaylasi': 'tent',
  'yesilgoz-mesire': 'lake',
  'berit-dagi': 'ridge',
  'ali-kayasi-menzelet': 'ridge',
  'dongel-magarasi': 'cedar forest',
  'engizek-dagi': 'ridge',
  'cokak-geben-orman': 'cedar forest',
  'ahir-dagi-etek': 'cedar forest',
  'binboga-keklikoluk': 'plateau',
  'nurhak-dagi': 'ridge',
  'hartlap-orman': 'cedar forest',
  yedikuyular: 'plateau',
  'halbur-yaylasi': 'tent',
  'kirksu-yaylasi': 'tent',
  'karagol-degirmendere': 'lake',
}

function pickPhoto(id, index) {
  const mood = MOOD_FOR[id] || 'cedar forest'
  const pool = photosByMood[mood].length ? photosByMood[mood] : images.photos
  return pool[index % pool.length].url
}

const usedIds = new Set(existing.map((r) => r.id))
const usedAuthors = new Set(existing.map((r) => r.author))
const added = []

for (let i = 0; i < research.length; i++) {
  const def = research[i]
  if (usedIds.has(def.id)) {
    console.warn(`skip existing id ${def.id}`)
    continue
  }
  const author = AUTHORS[i]
  if (!author || usedAuthors.has(author)) throw new Error(`author missing or duplicate at ${i}`)
  const track = buildTrack(def.spine, { loop: def.loop, seed: 9100 + i * 131 })
  const stats = trackStats(track)
  const distanceKm = Math.round(stats.dist * 100) / 100
  const elevationGainM = Math.round(stats.gain)
  const elevationLossM = Math.round(stats.loss)
  const maxElevationM = Math.round(stats.maxE)
  const minElevationM = Math.round(stats.minE)
  const mid = notableIndex(track)
  const points = [track[0], track[mid], track[track.length - 1]]
  const [rating, ratingCount] = RATINGS[i]
  added.push({
    id: def.id,
    title: def.title,
    activity: def.activity,
    region: def.region,
    city: def.city,
    difficulty: difficultyOf(elevationGainM, distanceKm),
    loop: def.loop,
    distanceKm,
    elevationGainM,
    elevationLossM,
    maxElevationM,
    minElevationM,
    durationMin: durationMin(def.activity, distanceKm, elevationGainM),
    rating,
    ratingCount,
    author,
    recordedAt: DATES[i],
    description: def.description,
    image: pickPhoto(def.id, i),
    track,
    waypoints: def.waypoints.map((name, wi) => ({
      name,
      lat: points[wi][0],
      lng: points[wi][1],
    })),
  })
  usedIds.add(def.id)
  usedAuthors.add(author)
}

const errors = []
for (const r of added) {
  if (r.track.length < 40) errors.push(`${r.id} short track ${r.track.length}`)
  if (!(r.distanceKm > 0.4)) errors.push(`${r.id} distance ${r.distanceKm}`)
  const endGap = haversineKm(r.track[0][0], r.track[0][1], r.track.at(-1)[0], r.track.at(-1)[1])
  if (r.loop && endGap > 0.15) errors.push(`${r.id} loop gap ${endGap}`)
  if (!r.loop && endGap < 0.15) errors.push(`${r.id} non-loop gap ${endGap}`)
  for (const [lat, lng, ele] of r.track) {
    if (lat < 37.2 || lat > 38.6 || lng < 36.1 || lng > 37.7) {
      errors.push(`${r.id} not in Maraş box ${lat},${lng}`)
      break
    }
    if (ele < 0) errors.push(`${r.id} negative ele`)
  }
  if (r.waypoints.length !== 3) errors.push(`${r.id} waypoints`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

const merged = [...existing, ...added]
writeFileSync(join(root, 'public', 'data', 'routes.json'), `${JSON.stringify(merged, null, 2)}\n`, 'utf8')

const counts = {}
for (const r of added) counts[r.activity] = (counts[r.activity] || 0) + 1
console.log(`added ${added.length}`)
console.log(`total ${merged.length}`)
console.log(`maraş activities ${JSON.stringify(counts)}`)
for (const r of added) {
  console.log(
    `${r.id} ${r.activity} ${r.distanceKm}km +${r.elevationGainM} ${r.difficulty} pts=${r.track.length}`,
  )
}
console.log('VALIDATION PASSED')
