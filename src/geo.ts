import type { RouteItem } from './types'

export interface ProfilePoint {
  distKm: number
  ele: number
  index: number
}

const EARTH_KM = 6371

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = Math.PI / 180
  const dLat = (bLat - aLat) * toRad
  const dLng = (bLng - aLng) * toRad
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(aLat * toRad) * Math.cos(bLat * toRad) * sinLng * sinLng
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function pointsClose(a: [number, number, number], b: [number, number, number]): boolean {
  return haversineKm(a[0], a[1], b[0], b[1]) < 0.04
}

export function buildProfile(track: [number, number, number][]): ProfilePoint[] {
  const out: ProfilePoint[] = []
  let dist = 0
  for (let i = 0; i < track.length; i++) {
    if (i > 0) {
      dist += haversineKm(track[i - 1][0], track[i - 1][1], track[i][0], track[i][1])
    }
    out.push({ distKm: dist, ele: track[i][2], index: i })
  }
  return out
}

export function nearestProfileIndex(points: ProfilePoint[], distKm: number): number {
  if (points.length <= 1) return 0
  let lo = 0
  let hi = points.length - 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (points[mid].distKm < distKm) lo = mid + 1
    else hi = mid
  }
  if (lo > 0) {
    const prev = Math.abs(points[lo - 1].distKm - distKm)
    const next = Math.abs(points[lo].distKm - distKm)
    if (prev <= next) return lo - 1
  }
  return lo
}

export function monotoneCubicPath(points: Array<{ x: number; y: number }>): string {
  const pts: Array<{ x: number; y: number }> = []
  for (const point of points) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue
    if (pts.length === 0 || point.x > pts[pts.length - 1].x + 1e-4) pts.push(point)
  }
  const n = pts.length
  if (n === 0) return ''
  if (n === 1) return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`

  const dx: number[] = []
  const slope: number[] = []
  for (let i = 0; i < n - 1; i++) {
    const h = pts[i + 1].x - pts[i].x
    dx.push(h)
    slope.push((pts[i + 1].y - pts[i].y) / h)
  }

  const tan = new Array<number>(n)
  tan[0] = slope[0]
  tan[n - 1] = slope[n - 2]
  for (let i = 1; i < n - 1; i++) {
    tan[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2
  }

  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(slope[i]) < 1e-8) {
      tan[i] = 0
      tan[i + 1] = 0
      continue
    }
    const a = tan[i] / slope[i]
    const b = tan[i + 1] / slope[i]
    const s = a * a + b * b
    if (s > 9) {
      const tau = 3 / Math.sqrt(s)
      tan[i] = tau * a * slope[i]
      tan[i + 1] = tau * b * slope[i]
    }
  }

  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i]
    const c1x = pts[i].x + h / 3
    const c1y = pts[i].y + (tan[i] * h) / 3
    const c2x = pts[i + 1].x - h / 3
    const c2y = pts[i + 1].y - (tan[i + 1] * h) / 3
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${pts[i + 1].x.toFixed(2)} ${pts[i + 1].y.toFixed(2)}`
  }
  return d
}

function xmlText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function downloadGpx(route: RouteItem): void {
  const name = xmlText(route.title)
  const points = route.track
    .map(
      ([lat, lng, ele]) =>
        `      <trkpt lat="${lat.toFixed(6)}" lon="${lng.toFixed(6)}"><ele>${ele.toFixed(1)}</ele></trkpt>`,
    )
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Yürüyom" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${name}</name></metadata>
  <trk>
    <name>${name}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>`
  const blob = new Blob([xml], { type: 'application/gpx+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const safeId = route.id.replace(/[\\/:*?"<>|]+/g, '_') || 'rota'
  link.href = url
  link.download = `${safeId}.gpx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}
