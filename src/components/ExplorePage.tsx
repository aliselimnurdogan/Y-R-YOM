import { useEffect, useMemo, useState } from 'react'
import { cx, formatInt, hasPlacePhoto, matchesPlace } from '../format'
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
import { fetchOsmCamps, mergePlaces } from '../overpass'
import { isWaterPlace, PROVINCES } from '../provinces'
import { APP_STEP, HAS_ATLAS, HAS_BLOOM, HAS_CATALOG, HAS_FEEL, HAS_LIVE, HAS_LOOK, HAS_POLISH } from '../step'
import { usePlaces } from '../places-context'
import { useSearch } from '../search-context'
import type { PlaceItem, PlaceKind } from '../types'
import { useMediaQuery } from '../use-media'
import { ExploreMap } from './ExploreMap'
import { PlaceCard } from './PlaceCard'

export function ExplorePage() {
  const turkey = APP_STEP !== '2'
  const catalog = HAS_CATALOG
  const kinds: PlaceKind[] = HAS_LIVE
    ? [...CAMP_KINDS, 'kamp', 'doga', 'manzara']
    : APP_STEP === '2'
      ? PLACE_KINDS
      : CAMP_KINDS
  const basePath = APP_STEP === '2' ? '/yer' : '/kamp'
  const title = HAS_ATLAS
    ? 'Türkiye kamp alanları'
    : HAS_LIVE
      ? 'Türkiye kamp, yayla ve doğa'
      : catalog
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
  const [province, setProvince] = useState('')
  const [only360, setOnly360] = useState(false)
  const [onlyWater, setOnlyWater] = useState(false)
  const [sort, setSort] = useState<PlaceSortKey>('featured')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [osm, setOsm] = useState<PlaceItem[]>([])
  const [osmStatus, setOsmStatus] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle')
  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(() => new Set())

  function markPhotoFail(id: string) {
    setFailedPhotos((current) => {
      if (current.has(id)) return current
      const next = new Set(current)
      next.add(id)
      return next
    })
  }

  useEffect(() => {
    document.title = HAS_BLOOM
      ? 'Yürüyom'
      : HAS_POLISH
      ? 'Yürüyom'
      : HAS_LIVE
      ? 'Yürüyom — 81 il'
      : HAS_LOOK
        ? 'Yürüyom — Net bakış'
        : HAS_FEEL
          ? 'Yürüyom — Orada gibi hisset'
          : catalog
            ? 'Yürüyom — Kamp rehberi'
            : turkey
              ? 'Yürüyom — Kamp alanları'
              : 'Yürüyom — Kahramanmaraş kamp ve doğa'
  }, [catalog, turkey])

  useEffect(() => {
    if (!HAS_LIVE || !province) {
      setOsm([])
      setOsmStatus('idle')
      return
    }
    let alive = true
    setOsmStatus('loading')
    void fetchOsmCamps(province)
      .then((items) => {
        if (!alive) return
        setOsm(items)
        setOsmStatus('ready')
      })
      .catch(() => {
        if (!alive) return
        setOsm([])
        setOsmStatus('error')
      })
    return () => {
      alive = false
    }
  }, [province])

  const merged = useMemo(() => (HAS_LIVE ? mergePlaces(places, osm) : places), [places, osm])

  const provinceOptions = useMemo(
    () => (zone ? PROVINCES.filter((item) => item.zone === zone) : PROVINCES),
    [zone],
  )

  const filtered = useMemo(() => {
    const list = merged.filter((place) => {
      if (catalog) {
        if (zone && place.zone !== zone) return false
      } else if (kind && place.kind !== kind) {
        return false
      }
      if (HAS_LIVE) {
        if (kind && place.kind !== kind) return false
        if (province && place.region !== province) return false
        if (only360 && !place.pano) return false
        if (onlyWater && !isWaterPlace(place.title, place.kind)) return false
      }
      return matchesPlace(place, query)
    })
    return [...list].sort((a, b) => {
      if (HAS_BLOOM) {
        const shown = (place: PlaceItem) => hasPlacePhoto(place) && !failedPhotos.has(place.id)
        const photo = Number(shown(b)) - Number(shown(a))
        if (photo !== 0) return photo
      }
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
  }, [merged, query, kind, zone, sort, kinds, catalog, province, only360, onlyWater, failedPhotos])

  const mapActive = !mobile || mode === 'map'
  const filtersOn = Boolean((catalog ? zone : kind) || query || province || only360 || onlyWater)

  function clearFilters() {
    setKind(null)
    setZone(null)
    setProvince('')
    setOnly360(false)
    setOnlyWater(false)
    setQuery('')
  }

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
                {HAS_LIVE && osmStatus === 'loading' ? ' · OSM yükleniyor' : ''}
                {HAS_LIVE && osmStatus === 'error' ? ' · OSM alınamadı' : ''}
                {HAS_LIVE && osmStatus === 'ready' ? ` · ${formatInt(osm.length)} OSM` : ''}
              </p>
            )}
            {catalog && <p className="catalog-banner">{LEGAL_CAMP_NOTE}</p>}
            {HAS_LIVE && (
              <p className="catalog-banner">
                {HAS_ATLAS
                  ? 'Harita sabit. Bölgeye tıklayınca o bölge kırmızı olur, kamplar yanda listelenir. Pin izin değildir.'
                  : '81 il filtresi ve OpenStreetMap canlı kamp katmanı. Pin izin değildir. İl seçince o ilin OSM kampları gelir.'}
              </p>
            )}
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
                      onClick={() => {
                        setZone(item)
                        if (province && !PROVINCES.some((row) => row.name === province && row.zone === item)) {
                          setProvince('')
                        }
                      }}
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
            {HAS_LIVE && (
              <>
                <label className="live-select">
                  {!HAS_POLISH && <span>İl</span>}
                  <select
                    value={province}
                    onChange={(event) => setProvince(event.target.value)}
                    aria-label="81 il"
                  >
                    <option value="">81 il — OSM için seç</option>
                    {provinceOptions.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="kind-row" role="group" aria-label="Hızlı filtre">
                  {kinds.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={cx('kind-pill', kind === item && 'is-on')}
                      onClick={() => setKind(kind === item ? null : item)}
                    >
                      <span className="swatch" style={{ background: PLACE_KIND_COLORS[item] }} />
                      {PLACE_KIND_LABELS[item]}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={cx('kind-pill', only360 && 'is-on')}
                    onClick={() => setOnly360((value) => !value)}
                  >
                    360° olanlar
                  </button>
                  <button
                    type="button"
                    className={cx('kind-pill', onlyWater && 'is-on')}
                    onClick={() => setOnlyWater((value) => !value)}
                  >
                    Su kenarı
                  </button>
                </div>
              </>
            )}
            <div className="subbar">
              {filtersOn ? (
                <button type="button" className="linkish" onClick={clearFilters}>
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
                <button type="button" className="linkish" onClick={clearFilters}>
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
                    onPhotoFail={HAS_BLOOM ? markPhotoFail : undefined}
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
          resetLabel={turkey || catalog ? 'Tüm Türkiye' : 'Kahramanmaraş'}
          zone={HAS_ATLAS ? zone : null}
          onSelectZone={
            HAS_ATLAS
              ? (next) => {
                  setZone(next)
                  if (next && province && !PROVINCES.some((row) => row.name === province && row.zone === next)) {
                    setProvince('')
                  }
                }
              : undefined
          }
        />
      </div>
    </section>
  )
}
