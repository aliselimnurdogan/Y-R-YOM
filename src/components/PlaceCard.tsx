import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatInt } from '../format'
import { PLACE_KIND_LABELS } from '../labels'
import type { PlaceItem } from '../types'

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
      width={132}
      height={98}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

export function PlaceCard({
  place,
  active,
  onHover,
  basePath,
}: {
  place: PlaceItem
  active: boolean
  onHover: (id: string | null) => void
  basePath: string
}) {
  return (
    <li className={active ? 'card is-on' : 'card'}>
      <Link
        to={`${basePath}/${place.id}`}
        className="card-link"
        onMouseEnter={() => onHover(place.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(place.id)}
        onBlur={() => onHover(null)}
      >
        <CardImage src={place.images[0] ?? ''} />
        <div className="card-body">
          <h2 className="card-title" title={place.title}>
            {place.title}
          </h2>
          <p className="card-meta">
            <span>{PLACE_KIND_LABELS[place.kind]}</span>
            <span className="dotsep" aria-hidden="true">
              ·
            </span>
            <span>{place.region}</span>
            <span className="dotsep" aria-hidden="true">
              ·
            </span>
            <span>{formatInt(place.elevationM)} m</span>
          </p>
          <p className="card-sub card-excerpt">{place.summary}</p>
        </div>
      </Link>
    </li>
  )
}
