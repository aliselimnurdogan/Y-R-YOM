import { useEffect, useMemo, useState } from 'react'
import { cx, formatInt, matchesQuery } from '../format'
import { PLACE_KINDS, PLACE_KIND_COLORS, PLACE_KIND_LABELS, PLACE_SORTS, type PlaceSortKey } from '../labels'
import { usePlaces } from '../places-context'
import { useSearch } from '../search-context'
import type { PlaceKind } from '../types'
import { useMediaQuery } from '../use-media'
import { ExploreMap } from './ExploreMap'
import { PlaceCard } from './PlaceCard'

export function ExplorePage() {
  const { status, places, reload } = usePlaces()
  const { query, setQuery } = useSearch()
  const mobile = useMediaQuery('(max-width: 860px)')
  const [mode, setMode] = useState<'list' | 'map'>('list')
  const [kind, setKind] = useState<PlaceKind | null>(null)
  const [sort, setSort] = useState<PlaceSortKey>('featured')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Yürüyom — Kahramanmaraş kamp ve doğa'
  }, [])

  const filtered = useMemo(() => {
    const list = places.filter((place) => {
      if (kind && place.kind !== kind) return false
      return matchesQuery(place, query)
    })
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.title.localeCompare(b.title, 'tr')
      if (sort === 'high') return b.elevationM - a.elevationM
      const rank = (value: PlaceKind) => PLACE_KINDS.indexOf(value)
      const diff = rank(a.kind) - rank(b.kind)
      if (diff !== 0) return diff
      return a.title.localeCompare(b.title, 'tr')
    })
  }, [places, query, kind, sort])

  const mapActive = !mobile || mode === 'map'

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
            <h1>Kahramanmaraş kamp ve doğa</h1>
            {status === 'ready' && (
              <p className="count" aria-live="polite">
                {formatInt(filtered.length)} alan
              </p>
            )}
            <div className="kind-row" role="group" aria-label="Alan türü">
              <button type="button" className={cx('kind-pill', !kind && 'is-on')} onClick={() => setKind(null)}>
                Tümü
              </button>
              {PLACE_KINDS.map((item) => (
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
              {kind || query ? (
                <button
                  type="button"
                  className="linkish"
                  onClick={() => {
                    setKind(null)
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
                  />
                ))}
              </ul>
            )}
          </div>
        </aside>
        <ExploreMap places={filtered} hoveredId={hoveredId} active={mapActive} />
      </div>
    </section>
  )
}
