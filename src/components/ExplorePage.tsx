import { useEffect, useMemo, useState } from 'react'
import { cx, formatInt, matchesPlace } from '../format'
import {
  CAMP_KINDS,
  CATALOG_ZONES,
  LEGAL_CAMP_NOTE,
  MARAS_CENTER,
  MARAS_ZOOM,
  PLACE_KINDS,
  PLACE_KIND_COLORS,
  PLACE_KIND_LABELS,
  PLACE_SORTS,
  TURKEY_CENTER,
  TURKEY_ZOOM,
  ZONE_COLORS,
  type PlaceSortKey,
} from '../labels'
import { APP_STEP, HAS_CATALOG, HAS_FEEL, HAS_LOOK } from '../step'
import { usePlaces } from '../places-context'
import { useSearch } from '../search-context'
import type { PlaceKind } from '../types'
import { useMediaQuery } from '../use-media'
import { ExploreMap } from './ExploreMap'
import { PlaceCard } from './PlaceCard'

export function ExplorePage() {
  const turkey = APP_STEP !== '2'
  const catalog = HAS_CATALOG
  const kinds = APP_STEP === '2' ? PLACE_KINDS : CAMP_KINDS
  const basePath = APP_STEP === '2' ? '/yer' : '/kamp'
  const title = catalog
    ? 'Türkiye korunan kamp alanları'
    : turkey
      ? 'Türkiye’deki kamp alanları'
      : 'Kahramanmaraş kamp ve doğa'
  const { status, places, reload } = usePlaces()
  const { query, setQuery } = useSearch()
  const mobile = useMediaQuery('(max-width: 860px)')
  const [mode, setMode] = useState<'list' | 'map'>('list')
  const [kind, setKind] = useState<PlaceKind | null>(null)
  const [zone, setZone] = useState<string | null>(null)
  const [sort, setSort] = useState<PlaceSortKey>('featured')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    document.title = HAS_LOOK
      ? 'Yürüyom — Net bakış'
      : HAS_FEEL
        ? 'Yürüyom — Orada gibi hisset'
        : catalog
        ? 'Yürüyom — Kamp rehberi'
        : turkey
          ? 'Yürüyom — Kamp alanları'
          : 'Yürüyom — Kahramanmaraş kamp ve doğa'
  }, [catalog, turkey])

  const filtered = useMemo(() => {
    const list = places.filter((place) => {
      if (catalog) {
        if (zone && place.zone !== zone) return false
      } else if (kind && place.kind !== kind) {
        return false
      }
      return matchesPlace(place, query)
    })
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.title.localeCompare(b.title, 'tr')
      if (sort === 'high') return b.elevationM - a.elevationM
      if (catalog) {
        const fee = (value: number | null | undefined) => (value == null ? 1 : 0)
        const diff = fee(a.feeTent) - fee(b.feeTent)
        if (diff !== 0) return diff
        return a.title.localeCompare(b.title, 'tr')
      }
      const rank = (value: PlaceKind) => kinds.indexOf(value)
      const diff = rank(a.kind) - rank(b.kind)
      if (diff !== 0) return diff
      return a.title.localeCompare(b.title, 'tr')
    })
  }, [places, query, kind, zone, sort, kinds, catalog])

  const mapActive = !mobile || mode === 'map'
  const filtersOn = Boolean((catalog ? zone : kind) || query)

  return (
    <section className="explore">
      <div className="mode-switch" role="group" aria-label="Görünüm">
        <button type="button" aria-pressed={mode === 'list'} onClick={() => setMode('list')}>
          Liste
        </button>
        <button type="button" aria-pressed={mode === 'map'} onClick={() => setMode('map')}>
          Harita
        </button>
      </div>
      <div className={mode === 'map' ? 'explore-body is-map' : 'explore-body is-list'}>
        <aside className="panel">
          <div className="panel-head">
            <h1>{title}</h1>
            {status === 'ready' && (
              <p className="count" aria-live="polite">
                {formatInt(filtered.length)} alan
              </p>
            )}
            {catalog && <p className="catalog-banner">{LEGAL_CAMP_NOTE}</p>}
            <div className="kind-row" role="group" aria-label={catalog ? 'Bölge' : 'Alan türü'}>
              <button
                type="button"
                className={cx('kind-pill', !(catalog ? zone : kind) && 'is-on')}
                onClick={() => {
                  setKind(null)
                  setZone(null)
                }}
              >
                Tümü
              </button>
              {catalog
                ? CATALOG_ZONES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={cx('kind-pill', zone === item && 'is-on')}
                      onClick={() => setZone(item)}
                    >
                      <span className="swatch" style={{ background: ZONE_COLORS[item] }} />
                      {item}
                    </button>
                  ))
                : kinds.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={cx('kind-pill', kind === item && 'is-on')}
                      onClick={() => setKind(item)}
                    >
                      <span className="swatch" style={{ background: PLACE_KIND_COLORS[item] }} />
                      {PLACE_KIND_LABELS[item]}
                    </button>
                  ))}
            </div>
            <div className="subbar">
              {filtersOn ? (
                <button
                  type="button"
                  className="linkish"
                  onClick={() => {
                    setKind(null)
                    setZone(null)
                    setQuery('')
                  }}
                >
                  Temizle
                </button>
              ) : (
                <span />
              )}
              <label className="sort-inline">
                <span className="sr-only">Sıralama</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as PlaceSortKey)}>
                  {PLACE_SORTS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="route-scroll">
            {status === 'loading' && (
              <div className="empty-note" role="status">
                Alanlar yükleniyor…
              </div>
            )}
            {status === 'error' && (
              <div className="empty-note" role="status">
                <p>Alanlar yüklenemedi</p>
                <button type="button" className="btn-ghost" onClick={reload}>
                  Tekrar dene
                </button>
              </div>
            )}
            {status === 'ready' && filtered.length === 0 && (
              <div className="empty-note" role="status">
                <p>Bu aramaya uygun alan yok.</p>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => {
                    setKind(null)
                    setZone(null)
                    setQuery('')
                  }}
                >
                  Temizle
                </button>
              </div>
            )}
            {status === 'ready' && filtered.length > 0 && (
              <ul className="route-list" aria-label="Kamp ve doğa alanları">
                {filtered.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    active={hoveredId === place.id}
                    onHover={setHoveredId}
                    basePath={basePath}
                  />
                ))}
              </ul>
            )}
          </div>
        </aside>
        <ExploreMap
          places={filtered}
          hoveredId={hoveredId}
          active={mapActive}
          basePath={basePath}
          center={turkey || catalog ? TURKEY_CENTER : MARAS_CENTER}
          zoom={turkey || catalog ? TURKEY_ZOOM : MARAS_ZOOM}
          resetLabel={turkey || catalog ? 'Türkiye' : 'Kahramanmaraş'}
        />
      </div>
    </section>
  )
}
