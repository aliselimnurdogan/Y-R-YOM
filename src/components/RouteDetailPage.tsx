import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { difficultyClass, formatDuration, formatInt, formatKm } from '../format'
import { downloadGpx } from '../geo'
import { ACTIVITY_COLORS, ACTIVITY_LABELS } from '../labels'
import { srcSet, sharpUrl } from '../media'
import { useRoutes } from '../routes-context'
import { useSearch } from '../search-context'
import { TrailThumb } from './Brand'
import { ElevationChart } from './ElevationChart'
import { RouteDetailMap, type WaypointFocus } from './RouteDetailMap'
import { HAS_POLISH, ROUTES_PATH } from '../step'

export function RouteDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { status, routes, reload } = useRoutes()
  const { setQuery } = useSearch()
  const route = routes.find((item) => item.id === id) ?? null
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [waypoint, setWaypoint] = useState<WaypointFocus | null>(null)
  const [coverOn, setCoverOn] = useState(true)

  useEffect(() => {
    setHoverIndex(null)
    setWaypoint(null)
    setCoverOn(true)
  }, [id])

  useEffect(() => {
    document.title = route ? `${route.title} · Yürüyom` : 'Yürüyom'
  }, [route])

  if (status === 'loading') {
    return (
      <div className="detail">
        <p className="empty-note">Rota yükleniyor…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="detail">
        <div className="empty-note">
          <p>Rotalar yüklenemedi</p>
          <button type="button" className="btn-ghost" onClick={reload}>
            Tekrar dene
          </button>
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="detail">
        <h1>Rota bulunamadı</h1>
        <p className="lede">Bu rota listede yok.</p>
        <Link className="btn-ghost stack-gap" to={ROUTES_PATH}>
          Rotalara dön
        </Link>
      </div>
    )
  }

  const stats: Array<{ value: string; label: string; compact?: boolean }> = [
    { value: formatKm(route.distanceKm), label: 'Mesafe km' },
    { value: formatInt(route.elevationGainM), label: 'Tırmanış m' },
    { value: formatInt(route.elevationLossM), label: 'İniş m' },
    { value: formatDuration(route.durationMin), label: 'Süre (saat/dk)', compact: true },
    { value: route.difficulty, label: 'Zorluk', compact: true },
    { value: formatInt(route.maxElevationM), label: 'En yüksek m' },
  ]

  return (
    <article className="detail">
      <nav className="crumb" aria-label="Konum">
        <Link
          to={ROUTES_PATH}
          onClick={() => {
            setQuery('')
          }}
        >
          Parkurlar
        </Link>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => {
            setQuery(route.region)
            navigate(ROUTES_PATH)
          }}
        >
          {route.region}
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => {
            setQuery(route.city)
            navigate(ROUTES_PATH)
          }}
        >
          {route.city}
        </button>
      </nav>
      <h1>{route.title}</h1>
      <div className="author-row">
        <span className="act-name" style={{ color: ACTIVITY_COLORS[route.activity] }}>
          {ACTIVITY_LABELS[route.activity]}
        </span>
        <span className={`chip ${difficultyClass(route.difficulty)}`}>{route.difficulty}</span>
        {route.loop && <span className="chip loop">Halka rota</span>}
        <div className="actions">
          <button
            type="button"
            className="btn-fill btn-lg"
            disabled={route.track.length === 0}
            onClick={() => downloadGpx(route)}
          >
            GPX indir
          </button>
          <Link className="btn-ghost" to={ROUTES_PATH}>
            Geri
          </Link>
        </div>
      </div>
      {coverOn && route.image ? (
        <img
          className="cover"
          src={sharpUrl(route.image, 1920)}
          srcSet={srcSet(route.image, [960, 1440, 1920])}
          sizes="(max-width: 860px) 100%, 1100px"
          alt=""
          onError={() => setCoverOn(false)}
        />
      ) : HAS_POLISH ? (
        <div className="cover trail-cover" aria-hidden="true">
          <TrailThumb seed={route.id} />
        </div>
      ) : null}
      <RouteDetailMap route={route} hoverIndex={hoverIndex} waypoint={waypoint} />
      <ElevationChart track={route.track} onHover={setHoverIndex} />
      <div className="stats">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <b className={stat.compact || stat.value.length > 8 ? 'compact' : undefined}>{stat.value}</b>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
      <div className="split">
        <section>
          <h2 className="section-title">Açıklama</h2>
          <p className="desc">{route.description.trim() ? route.description : 'Açıklama eklenmemiş.'}</p>
        </section>
        <section>
          <h2 className="section-title">Geçiş noktaları</h2>
          {route.waypoints.length === 0 ? (
            <p className="muted">Bu rota için geçiş noktası yok.</p>
          ) : (
            <ul className="wp-list">
              {route.waypoints.map((point, index) => (
                <li key={`${point.name}-${index}`}>
                  <button
                    type="button"
                    aria-current={waypoint?.i === index ? 'true' : undefined}
                    onClick={() => setWaypoint({ lat: point.lat, lng: point.lng, i: index, n: Date.now() })}
                  >
                    <span className="wp-num">{index + 1}</span>
                    {point.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </article>
  )
}
