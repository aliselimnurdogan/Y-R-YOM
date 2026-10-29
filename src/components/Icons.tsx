import { useId } from 'react'

export function PinMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#6db33f"
        d="M12 1.8c-4.3 0-7.7 3.4-7.7 7.6 0 5.6 7.7 12.8 7.7 12.8s7.7-7.2 7.7-12.8c0-4.2-3.4-7.6-7.7-7.6z"
      />
      <circle cx="12" cy="9.3" r="2.7" fill="#fff" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 16.5 20.5 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.2 12S6 5.5 12 5.5 21.8 12 21.8 12 18 18.5 12 18.5 2.2 12 2.2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  )
}

export function UpIcon() {
  return (
    <svg className="up" width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M6 10.2V2.2M6 2.2 2.6 5.6M6 2.2l3.4 3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M2.4 4.4 6 8l3.6-3.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Star({ fill }: { fill: number }) {
  const id = `star${useId().replace(/:/g, '')}`
  const pct = `${Math.round(Math.max(0, Math.min(1, fill)) * 100)}%`
  return (
    <svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset={pct} stopColor="#e2a100" />
          <stop offset={pct} stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} d="M10 1.7 12.4 7l5.8.5-4.4 3.8 1.4 5.7L10 14.2 4.8 17l1.4-5.7L1.8 7.5 7.6 7z" />
    </svg>
  )
}

export function Stars({ value }: { value: number }) {
  const score = Math.max(0, Math.min(5, value))
  const label = `Puan ${score.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} / 5`
  return (
    <span className="stars" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} fill={score - index} />
      ))}
    </span>
  )
}
