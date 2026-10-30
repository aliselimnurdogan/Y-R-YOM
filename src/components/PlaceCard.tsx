import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatFee, formatInt, placeCover } from '../format'
import { PLACE_KIND_LABELS } from '../labels'
import { srcSet, sharpUrl } from '../media'
import { HAS_CATALOG, HAS_FEEL } from '../step'
import type { PlaceItem } from '../types'
import { TrailThumb } from './Brand'

function CardImage({
  src,
  seed,
  onFail,
}: {
  src: string
  seed: string
  onFail?: () => void
}) {
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    setFailed(false)
  }, [src])
  if (!src || failed) return <TrailThumb seed={seed} />
  return (
    <img
      className="thumb"
      src={sharpUrl(src, 1600)}
      srcSet={srcSet(src, [400, 800, 1600])}
      sizes="168px"
      alt=""
      referrerPolicy="no-referrer"
      width={132}
      height={98}
      loading="lazy"
      decoding="async"
      onError={() => {
        setFailed(true)
        onFail?.()
      }}
    />
  )
}

export function PlaceCard({
  place,
  active,
  onHover,
  onPhotoFail,
  basePath,
}: {
  place: PlaceItem
  active: boolean
  onHover: (id: string | null) => void
  onPhotoFail?: (id: string) => void
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
          <CardImage
            src={placeCover(place)}
            seed={place.id}
            onFail={onPhotoFail ? () => onPhotoFail(place.id) : undefined}
          />
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
