import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatFee, formatInt } from '../format'
import { PLACE_KIND_LABELS } from '../labels'
import { HAS_CATALOG, HAS_FEEL } from '../step'
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
        <div className="thumb-wrap">
          <CardImage src={place.images[0] ?? place.pano?.preview ?? ''} />
          {HAS_FEEL && place.pano && (
            <span className="pano-badge">{place.pano.kind === '360' ? '360°' : 'Bakış'}</span>
          )}
        </div>
        <div className="card-body">
          <h2 className="card-title" title={place.title}>
            {place.title}
          </h2>
          <p className="card-meta">
            <span>{HAS_CATALOG ? (place.statusLabel ?? PLACE_KIND_LABELS[place.kind]) : PLACE_KIND_LABELS[place.kind]}</span>
            <span className="dotsep" aria-hidden="true">
              ·
            </span>
            <span>{place.region}</span>
            <span className="dotsep" aria-hidden="true">
              ·
            </span>
            <span>{HAS_CATALOG ? formatFee(place.feeTent) : `${formatInt(place.elevationM)} m`}</span>
          </p>
          <p className="card-sub card-excerpt">{place.guide?.difficulty ?? place.summary}</p>
        </div>
      </Link>
    </li>
  )
}
