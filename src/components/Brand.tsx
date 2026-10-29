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

const BLOOMS = [
  { petal: '#fff6d8', edge: '#e0b84a', heart: '#d4a017' },
  { petal: '#ffdce3', edge: '#d98996', heart: '#d4a017' },
  { petal: '#fff1c4', edge: '#d4b056', heart: '#c4922c' },
  { petal: '#f0d6f4', edge: '#c398cb', heart: '#d4a017' },
]

export function TrailThumb({ seed }: { seed: string; title?: string }) {
  const hash = hashSeed(seed)
  const bloom = BLOOMS[hash % BLOOMS.length]
  const x = 66
  const y = 46
  const gid = `bloom${hash}`
  const petals = [0, 51, 102, 153, 204, 255, 306]

  return (
    <div className="trail-thumb is-bloom" aria-hidden="true">
      <svg viewBox="0 0 132 98" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#edf3e6" />
            <stop offset="100%" stopColor="#c5d6b4" />
          </linearGradient>
        </defs>
        <rect width="132" height="98" fill={`url(#${gid})`} />
        <ellipse cx="28" cy="102" rx="46" ry="22" fill="#9fb58a" />
        <ellipse cx="110" cy="106" rx="44" ry="20" fill="#8ea87a" />
        <path
          d={`M${x} ${y + 12} C ${x - 2} ${y + 32}, ${x + 4} ${y + 52}, ${x} 92`}
          fill="none"
          stroke="#4f6d3d"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <ellipse cx={x - 11} cy={y + 30} rx="9" ry="4" fill="#5f8248" transform={`rotate(-32 ${x - 11} ${y + 30})`} />
        <ellipse cx={x + 12} cy={y + 36} rx="8" ry="3.6" fill="#6b9154" transform={`rotate(30 ${x + 12} ${y + 36})`} />
        {petals.map((deg) => (
          <ellipse
            key={deg}
            cx={x}
            cy={y - 13}
            rx="6.4"
            ry="14"
            fill={bloom.petal}
            stroke={bloom.edge}
            strokeWidth="0.85"
            transform={`rotate(${deg} ${x} ${y})`}
          />
        ))}
        <circle cx={x} cy={y} r="6.4" fill={bloom.heart} />
        <circle cx={x} cy={y} r="2.6" fill="#fbf3d6" />
      </svg>
    </div>
  )
}
