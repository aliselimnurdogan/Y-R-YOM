import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatInt, formatKm } from '../format'
import { ACTIVITY_LABELS } from '../labels'
import type { RouteItem } from '../types'
import { EyeIcon, UpIcon } from './Icons'

function CardImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    setFailed(false)
  }, [src])
  if (!src || failed) return <div className="thumb fallback" aria-hidden="true" />
  return (
    <img
      className="thumb"
      src={src}
      alt=""
      width={108}
      height={82}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

export function RouteCard({
  route,
  onMap,
  onToggleEye,
}: {
  route: RouteItem
  onMap: boolean
  onToggleEye: (id: string) => void
}) {
  const canDraw = route.track.length > 1
  return (
    <li className={onMap ? 'card is-on' : 'card'}>
      <Link to={`/rota/${route.id}`} className="card-link">
        <CardImage src={route.image} />
        <div className="card-body">
          <h2 className="card-title" title={route.title}>
            {route.title}
          </h2>
          <p className="card-meta">
            <span>{ACTIVITY_LABELS[route.activity]}</span>
            <span className="dotsep" aria-hidden="true">
              ·
            </span>
            <span>{formatKm(route.distanceKm)} km</span>
            <span className="dotsep" aria-hidden="true">
              ·
            </span>
            <span className="gain">
              <UpIcon /> {formatInt(route.elevationGainM)} m
            </span>
          </p>
          <p className="card-sub card-excerpt">{route.city}</p>
        </div>
      </Link>
      <button
        type="button"
        className="eye"
        aria-pressed={onMap}
        aria-label={onMap ? `${route.title} haritada gizle` : `${route.title} haritada göster`}
        disabled={!canDraw}
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          if (canDraw) onToggleEye(route.id)
        }}
      >
        <EyeIcon />
      </button>
    </li>
  )
}
