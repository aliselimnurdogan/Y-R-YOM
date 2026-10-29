import { HAS_POLISH } from '../step'

export function TrailMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      className="trail-mark"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="48" height="48" rx="14" fill="#24382e" />
      <path d="M3 31.5 15.5 17l8.2 8.4L35 13.5 45 27.2V45H3Z" fill="#3b5c4c" />
      <path d="M3 37.5 13.8 27.2l8 6.2L32.6 21.8 45 35.4V45H3Z" fill="#1b2c24" />
      <path
        d="M12.5 41.5c2.2-6.4 6.4-8.8 8.8-13.2 2.5-4.5 6.4-8.2 11.4-12"
        fill="none"
        stroke="#e2c57a"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="33.4" cy="15.4" r="2.35" fill="#f6ead0" />
    </svg>
  )
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? 'brand-lockup is-compact' : 'brand-lockup'}>
      <TrailMark size={compact ? 28 : 34} />
      <span className="wordmark">
        yürü<span>yom</span>
      </span>
    </span>
  )
}

export function MapBrand() {
  if (!HAS_POLISH) return null
  return (
    <div className="map-brand" aria-hidden="true">
      <TrailMark size={20} />
      <span>yürüyom</span>
    </div>
  )
}

function hashSeed(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

export function TrailThumb({ seed, title }: { seed: string; title?: string }) {
  const hash = hashSeed(seed)
  const shift = (hash % 18) - 9
  const peak = 18 + (hash % 10)
  return (
    <div className="trail-thumb" aria-hidden="true">
      <svg viewBox="0 0 132 98" preserveAspectRatio="xMidYMid slice">
        <rect width="132" height="98" fill="#24382e" />
        <path d={`M0 78 C 28 ${58 + shift}, 52 ${40 + shift}, 78 ${peak} L132 ${28 + (hash % 8)} V98 H0Z`} fill="#3b5c4c" />
        <path d={`M0 88 C 24 ${70 + shift}, 58 ${56 + shift}, 90 ${42 + (hash % 6)} L132 58 V98 H0Z`} fill="#1b2c24" />
        <path
          d={`M14 90 C 28 ${76 + (shift % 4)}, 46 ${68 + (shift % 3)}, 62 ${58 + (hash % 5)} S 96 ${36 + (hash % 4)}, 118 28`}
          fill="none"
          stroke="#e2c57a"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      {title ? <span className="trail-thumb-label">{title.slice(0, 1)}</span> : null}
    </div>
  )
}
