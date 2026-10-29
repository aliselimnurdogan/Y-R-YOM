import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { buildProfile, monotoneCubicPath, nearestProfileIndex, type ProfilePoint } from '../geo'
import { formatInt } from '../format'

function niceTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return []
  const rough = (max - min) / count
  const mag = 10 ** Math.floor(Math.log10(rough))
  const residual = rough / mag
  const step = residual >= 7 ? 10 * mag : residual >= 3 ? 5 * mag : residual >= 1.5 ? 2 * mag : mag
  if (!Number.isFinite(step) || step <= 0) return []
  const start = Math.ceil((min + step * 1e-6) / step) * step
  const ticks: number[] = []
  for (let value = start; value < max - step * 0.15 && ticks.length < 8; value += step) {
    ticks.push(Math.round(value * 1000) / 1000)
  }
  return ticks
}

function formatAxisKm(value: number, max: number): string {
  const digits = max < 8 ? 1 : 0
  return value.toLocaleString('tr-TR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

export function ElevationChart({
  track,
  onHover,
}: {
  track: [number, number, number][]
  onHover: (index: number | null) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const onHoverRef = useRef(onHover)
  onHoverRef.current = onHover
  const [size, setSize] = useState({ w: 0, h: 150 })
  const [cursorX, setCursorX] = useState<number | null>(null)
  const [hover, setHover] = useState<ProfilePoint | null>(null)
  const profile = useMemo(() => buildProfile(track), [track])

  useEffect(() => {
    setHover(null)
    setCursorX(null)
    onHoverRef.current(null)
  }, [track])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const w = Math.round(el.clientWidth)
      const h = Math.round(el.clientHeight)
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const geometry = useMemo(() => {
    if (profile.length < 2 || size.w < 20 || size.h < 20) return null
    const pad = { l: 52, r: 12, t: 14, b: 24 }
    const innerW = Math.max(1, size.w - pad.l - pad.r)
    const innerH = Math.max(1, size.h - pad.t - pad.b)
    let minE = Infinity
    let maxE = -Infinity
    for (const point of profile) {
      if (point.ele < minE) minE = point.ele
      if (point.ele > maxE) maxE = point.ele
    }
    if (maxE - minE < 1) {
      minE -= 10
      maxE += 10
    } else {
      const padE = (maxE - minE) * 0.08
      minE -= padE
      maxE += padE * 0.25
    }
    const maxDist = profile[profile.length - 1]?.distKm ?? 0
    const yOf = (ele: number) => pad.t + ((maxE - ele) / (maxE - minE)) * innerH
    const xOf = (dist: number) => (maxDist <= 0 ? pad.l + innerW / 2 : pad.l + (dist / maxDist) * innerW)
    const plot =
      maxDist <= 0
        ? [
            { x: pad.l, y: yOf(profile[0].ele) },
            { x: pad.l + innerW, y: yOf(profile[0].ele) },
          ]
        : profile.map((point) => ({ x: xOf(point.distKm), y: yOf(point.ele) }))
    const line = monotoneCubicPath(plot)
    const baseline = pad.t + innerH
    const area = line
      ? `${line} L ${plot[plot.length - 1].x.toFixed(2)} ${baseline.toFixed(2)} L ${plot[0].x.toFixed(2)} ${baseline.toFixed(2)} Z`
      : ''
    const yTicks = niceTicks(minE, maxE, 4)
    const xCount = maxDist < 2 ? 2 : 4
    const xLabels = Array.from({ length: xCount + 1 }, (_, index) => (maxDist * index) / xCount)
    return { pad, innerW, innerH, maxDist, yOf, xOf, line, area, yTicks, xLabels, baseline }
  }, [profile, size])

  function move(event: PointerEvent<SVGSVGElement>) {
    if (!geometry || profile.length === 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * size.w
    const clamped = Math.min(geometry.pad.l + geometry.innerW, Math.max(geometry.pad.l, x))
    const dist = geometry.maxDist <= 0 ? 0 : ((clamped - geometry.pad.l) / geometry.innerW) * geometry.maxDist
    const index = nearestProfileIndex(profile, dist)
    const point = profile[index]
    setCursorX(clamped)
    setHover(point)
    onHoverRef.current(point.index)
  }

  function clear() {
    setCursorX(null)
    setHover(null)
    onHoverRef.current(null)
  }

  const tipLeft = hover && cursorX !== null ? Math.min(size.w - 132, Math.max(8, cursorX + 12 > size.w - 120 ? cursorX - 124 : cursorX + 10)) : 0

  return (
    <div className="elev-card" ref={ref}>
      {profile.length < 2 && <div className="elev-empty">Yükseklik profili yok</div>}
      {profile.length >= 2 && geometry && (
        <>
          <svg
            width={size.w}
            height={size.h}
            viewBox={`0 0 ${size.w} ${size.h}`}
            role="img"
            aria-label="Yükseklik profili"
            onPointerMove={move}
            onPointerDown={move}
            onPointerLeave={clear}
            onPointerCancel={clear}
          >
            {geometry.yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={geometry.pad.l}
                  x2={geometry.pad.l + geometry.innerW}
                  y1={geometry.yOf(tick)}
                  y2={geometry.yOf(tick)}
                  stroke="#e6e8eb"
                  strokeWidth={1}
                />
                <text
                  x={geometry.pad.l - 6}
                  y={geometry.yOf(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="#6b7280"
                  fontSize="11"
                  fontFamily="Nunito, sans-serif"
                >
                  {formatInt(tick)}
                </text>
              </g>
            ))}
            {geometry.area && <path d={geometry.area} fill="rgba(109,179,63,0.28)" stroke="none" />}
            {geometry.line && (
              <path
                d={geometry.line}
                fill="none"
                stroke="#3e8f18"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {geometry.xLabels.map((dist, index) => (
              <text
                key={dist}
                x={geometry.xOf(dist)}
                y={size.h - 6}
                textAnchor={index === 0 ? 'start' : index === geometry.xLabels.length - 1 ? 'end' : 'middle'}
                fill="#6b7280"
                fontSize="11"
                fontFamily="Nunito, sans-serif"
              >
                {index === geometry.xLabels.length - 1
                  ? `${formatAxisKm(dist, geometry.maxDist)} km`
                  : formatAxisKm(dist, geometry.maxDist)}
              </text>
            ))}
            {cursorX !== null && hover && (
              <g>
                <line
                  x1={cursorX}
                  x2={cursorX}
                  y1={geometry.pad.t}
                  y2={geometry.baseline}
                  stroke="rgba(62,143,24,0.75)"
                  strokeWidth={1}
                />
                <circle
                  cx={geometry.xOf(hover.distKm)}
                  cy={geometry.yOf(hover.ele)}
                  r={4}
                  fill="#3e8f18"
                  stroke="#fff"
                  strokeWidth={2}
                />
              </g>
            )}
          </svg>
          {hover && cursorX !== null && (
            <div className="elev-tip" style={{ left: tipLeft }}>
              {hover.distKm.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} km · {formatInt(hover.ele)} m
            </div>
          )}
        </>
      )}
    </div>
  )
}
