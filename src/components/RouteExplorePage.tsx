import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cx, featuredScore, formatInt, matchesRoute } from '../format'
import {
  ACTIVITIES,
  ACTIVITY_COLORS,
  ACTIVITY_LABELS,
  CLIMB_BANDS,
  DIFFICULTIES,
  DISTANCE_BANDS,
  SORTS,
  type ClimbBandId,
  type DistanceBandId,
  type SortKey,
} from '../labels'
import { useRoutes } from '../routes-context'
import { useSearch } from '../search-context'
import { HAS_BLOOM } from '../step'
import type { Activity, Difficulty } from '../types'
import { useMediaQuery } from '../use-media'
import { ChevronIcon } from './Icons'
import { RouteExploreMap } from './RouteExploreMap'
import { RouteCard } from './RouteCard'

interface Filters {
  activities: Activity[]
  distances: DistanceBandId[]
  climbs: ClimbBandId[]
  difficulties: Difficulty[]
  loopOnly: boolean
}

const EMPTY_FILTERS: Filters = {
  activities: [],
  distances: [],
  climbs: [],
  difficulties: [],
  loopOnly: false,
}

type Menu = 'activity' | 'distance' | 'climb' | 'difficulty' | 'loop' | 'sort' | null

function toggleItem<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function RouteExplorePage() {
  const { status, routes, reload } = useRoutes()
  const { query, setQuery } = useSearch()
  const mobile = useMediaQuery('(max-width: 860px)')
  const [mode, setMode] = useState<'list' | 'map'>('list')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<SortKey>('featured')
  const [menu, setMenu] = useState<Menu>(null)
  const [eyes, setEyes] = useState<Set<string>>(() => new Set())
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Yürüyom — Yürüyüş parkurları'
  }, [])

  useEffect(() => {
    if (!menu) return
    const onPointer = (event: MouseEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setMenu(null)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(null)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [menu])

  const filtersActive =
    filters.activities.length > 0 ||
    filters.distances.length > 0 ||
    filters.climbs.length > 0 ||
    filters.difficulties.length > 0 ||
    filters.loopOnly

  const filtered = useMemo(() => {
    const list = routes.filter((route) => {
      if (!matchesRoute(route, query)) return false
      if (filters.activities.length > 0 && !filters.activities.includes(route.activity)) return false
      if (
        filters.distances.length > 0 &&
        !filters.distances.some((id) => DISTANCE_BANDS.find((band) => band.id === id)?.match(route.distanceKm))
      ) {
        return false
      }
      if (
        filters.climbs.length > 0 &&
        !filters.climbs.some((id) => CLIMB_BANDS.find((band) => band.id === id)?.match(route.elevationGainM))
      ) {
        return false
      }
      if (filters.difficulties.length > 0 && !filters.difficulties.includes(route.difficulty)) return false
      if (filters.loopOnly && !route.loop) return false
      return true
    })
    return [...list].sort((a, b) => {
      if (HAS_BLOOM) {
        const photo = Number(Boolean(b.image)) - Number(Boolean(a.image))
        if (photo !== 0) return photo
      }
      let diff = 0
      if (sort === 'longest') diff = b.distanceKm - a.distanceKm
      else if (sort === 'shortest') diff = a.distanceKm - b.distanceKm
      else if (sort === 'climb') diff = b.elevationGainM - a.elevationGainM
      else diff = featuredScore(b) - featuredScore(a)
      if (diff !== 0) return diff
      return a.title.localeCompare(b.title, 'tr')
    })
  }, [routes, query, filters, sort])

  const shown = useMemo(
    () => filtered.filter((route) => eyes.has(route.id) && route.track.length > 1),
    [filtered, eyes],
  )

  function clearFilters() {
    setFilters(EMPTY_FILTERS)
    setMenu(null)
  }

  function toggleEye(id: string) {
    setEyes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openMenu(next: Exclude<Menu, null>) {
    setMenu((current) => (current === next ? null : next))
  }

  const sortLabel = SORTS.find((item) => item.id === sort)?.label ?? 'Öne çıkan'
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
          <div className="panel-head" ref={barRef}>
            <h1>Yürüyüş parkurları</h1>
            {status === 'ready' && (
              <p className="count" aria-live="polite">
                {formatInt(filtered.length)} rota
              </p>
            )}
            <div className="filters">
              <FilterMenu
                label="Aktivite"
                pressed={filters.activities.length > 0}
                open={menu === 'activity'}
                controls="menu-activity"
                onClick={() => openMenu('activity')}
              >
                <div className="dropdown" id="menu-activity" role="group" aria-label="Aktivite">
                  {ACTIVITIES.map((activity) => (
                    <label className="check" key={activity}>
                      <input
                        type="checkbox"
                        checked={filters.activities.includes(activity)}
                        onChange={() =>
                          setFilters((current) => ({
                            ...current,
                            activities: toggleItem(current.activities, activity),
                          }))
                        }
                      />
                      <span className="swatch" style={{ background: ACTIVITY_COLORS[activity] }} />
                      {ACTIVITY_LABELS[activity]}
                    </label>
                  ))}
                </div>
              </FilterMenu>
              <FilterMenu
                label="Mesafe"
                pressed={filters.distances.length > 0}
                open={menu === 'distance'}
                controls="menu-distance"
                onClick={() => openMenu('distance')}
              >
                <div className="dropdown" id="menu-distance" role="group" aria-label="Mesafe">
                  {DISTANCE_BANDS.map((band) => (
                    <label className="check" key={band.id}>
                      <input
                        type="checkbox"
                        checked={filters.distances.includes(band.id)}
                        onChange={() =>
                          setFilters((current) => ({
                            ...current,
                            distances: toggleItem(current.distances, band.id),
                          }))
                        }
                      />
                      {band.label}
                    </label>
                  ))}
                </div>
              </FilterMenu>
              <FilterMenu
                label="Tırmanış"
                pressed={filters.climbs.length > 0}
                open={menu === 'climb'}
                controls="menu-climb"
                onClick={() => openMenu('climb')}
              >
                <div className="dropdown" id="menu-climb" role="group" aria-label="Tırmanış">
                  {CLIMB_BANDS.map((band) => (
                    <label className="check" key={band.id}>
                      <input
                        type="checkbox"
                        checked={filters.climbs.includes(band.id)}
                        onChange={() =>
                          setFilters((current) => ({
                            ...current,
                            climbs: toggleItem(current.climbs, band.id),
                          }))
                        }
                      />
                      {band.label}
                    </label>
                  ))}
                </div>
              </FilterMenu>
              <FilterMenu
                label="Zorluk"
                pressed={filters.difficulties.length > 0}
                open={menu === 'difficulty'}
                controls="menu-difficulty"
                alignEnd
                onClick={() => openMenu('difficulty')}
              >
                <div className="dropdown" id="menu-difficulty" role="group" aria-label="Zorluk">
                  {DIFFICULTIES.map((level) => (
                    <label className="check" key={level}>
                      <input
                        type="checkbox"
                        checked={filters.difficulties.includes(level)}
                        onChange={() =>
                          setFilters((current) => ({
                            ...current,
                            difficulties: toggleItem(current.difficulties, level),
                          }))
                        }
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </FilterMenu>
              <FilterMenu
                label="Halka rota"
                pressed={filters.loopOnly}
                open={menu === 'loop'}
                controls="menu-loop"
                alignEnd
                onClick={() => openMenu('loop')}
              >
                <div className="dropdown" id="menu-loop">
                  <button
                    type="button"
                    className={filters.loopOnly ? 'switch switch-on' : 'switch'}
                    role="switch"
                    aria-checked={filters.loopOnly}
                    onClick={() => setFilters((current) => ({ ...current, loopOnly: !current.loopOnly }))}
                  >
                    <span className="switch-track" aria-hidden="true">
                      <span className="switch-knob" />
                    </span>
                    Yalnızca halka rotalar
                  </button>
                </div>
              </FilterMenu>
            </div>
            <div className="subbar">
              {filtersActive ? (
                <button type="button" className="linkish" onClick={clearFilters}>
                  Temizle
                </button>
              ) : (
                <span />
              )}
              <div className="filter drop-end">
                <button
                  type="button"
                  className="sort-btn"
                  aria-expanded={menu === 'sort'}
                  aria-haspopup="listbox"
                  aria-controls="menu-sort"
                  onClick={() => openMenu('sort')}
                >
                  {sortLabel}
                  <ChevronIcon />
                </button>
                {menu === 'sort' && (
                  <ul className="dropdown sort-menu" id="menu-sort" role="listbox" aria-label="Sıralama">
                    {SORTS.map((item) => (
                      <li key={item.id} role="none">
                        <button
                          type="button"
                          role="option"
                          aria-selected={sort === item.id}
                          onClick={() => {
                            setSort(item.id)
                            setMenu(null)
                          }}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="route-scroll">
            {status === 'loading' && (
              <div className="empty-note" role="status">
                Rotalar yükleniyor…
              </div>
            )}
            {status === 'error' && (
              <div className="empty-note" role="status">
                <p>Rotalar yüklenemedi</p>
                <button type="button" className="btn-ghost" onClick={reload}>
                  Tekrar dene
                </button>
              </div>
            )}
            {status === 'ready' && filtered.length === 0 && (
              <div className="empty-note" role="status">
                <p>Bu filtrelere uygun rota yok.</p>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => {
                    clearFilters()
                    setQuery('')
                  }}
                >
                  Temizle
                </button>
              </div>
            )}
            {status === 'ready' && filtered.length > 0 && (
              <ul className="route-list" aria-label="Rota listesi">
                {filtered.map((route) => (
                  <RouteCard key={route.id} route={route} onMap={eyes.has(route.id)} onToggleEye={toggleEye} />
                ))}
              </ul>
            )}
          </div>
        </aside>
        <RouteExploreMap routes={filtered} shown={shown} active={mapActive} />
      </div>
    </section>
  )
}

function FilterMenu({
  label,
  pressed,
  open,
  controls,
  onClick,
  alignEnd,
  children,
}: {
  label: string
  pressed: boolean
  open: boolean
  controls: string
  onClick: () => void
  alignEnd?: boolean
  children: ReactNode
}) {
  return (
    <div className={alignEnd ? 'filter drop-end' : 'filter'}>
      <button
        type="button"
        className={cx('pill', open && 'is-open')}
        aria-pressed={pressed}
        aria-expanded={open}
        aria-controls={controls}
        onClick={onClick}
      >
        {label}
        <ChevronIcon />
      </button>
      {open && children}
    </div>
  )
}
