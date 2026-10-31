import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { provinceCenter } from '../admin-geo'
import { featuredScore, foldTr, formatInt, formatKm, hasPlacePhoto, placeCover } from '../format'
import { LAND_BUCKETS, landBucket } from '../intents'
import { ACTIVITY_LABELS, CATALOG_ZONES, PLACE_KIND_LABELS, ZONE_SHORT, type CatalogZone } from '../labels'
import { sharpUrl } from '../media'
import { fetchOsmCamps, fetchWikiGeo, mergePlaces } from '../overpass'
import { PROVINCES, zoneOfProvince } from '../provinces'
import { usePlaces } from '../places-context'
import { useRoutes } from '../routes-context'
import { useSearch } from '../search-context'
import { HAS_LAND, HAS_TOUR } from '../step'
import type { PlaceItem } from '../types'
import { TrailThumb } from './Brand'
import { TurkeyMap } from './TurkeyMap'

export function HomePage() {
  const { status: routeStatus, routes } = useRoutes()
  const { status: placeStatus, places } = usePlaces()
  const { setGeoPick, setQuery } = useSearch()
  const navigate = useNavigate()
  const [tourZone, setTourZone] = useState<CatalogZone | null>(null)
  const [tourProvince, setTourProvince] = useState('')
  const [illerOpen, setIllerOpen] = useState(false)
  const [illerQuery, setIllerQuery] = useState('')
  const [live, setLive] = useState<PlaceItem[]>([])
  const [liveStatus, setLiveStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    document.title = 'Yürüyom'
  }, [])

  useEffect(() => {
    if (!HAS_LAND || !tourProvince) {
      setLive([])
      setLiveStatus('idle')
      return
    }
    let alive = true
    setLiveStatus('loading')
    const center = provinceCenter(tourProvince)
    void Promise.all([
      fetchOsmCamps(tourProvince),
      center ? fetchWikiGeo(tourProvince, center[0], center[1]) : Promise.resolve([]),
    ])
      .then(([osmItems, wikiItems]) => {
        if (!alive) return
        setLive(mergePlaces(osmItems, wikiItems))
        setLiveStatus('ready')
      })
      .catch(() => {
        if (!alive) return
        setLive([])
        setLiveStatus('error')
      })
    return () => {
      alive = false
    }
  }, [tourProvince])

  const trailPicks = useMemo(
    () =>
      [...routes]
        .filter((route) => route.image)
        .sort((a, b) => featuredScore(b) - featuredScore(a))
        .slice(0, 8),
    [routes],
  )
  const campPicks = useMemo(
    () => [...places].filter((place) => hasPlacePhoto(place)).slice(0, 8),
    [places],
  )
  const mosaic = [
    ...trailPicks.slice(0, 3).map((route) => route.image),
    ...campPicks.slice(0, 3).map((place) => placeCover(place)),
  ]
    .filter(Boolean)
    .slice(0, 4)

  const tourProvinces = useMemo(
    () => (tourZone ? PROVINCES.filter((item) => item.zone === tourZone) : PROVINCES),
    [tourZone],
  )

  const filteredIller = useMemo(() => {
    const q = illerQuery.trim()
    if (!q) return PROVINCES
    return PROVINCES.filter(
      (item) => foldTr(item.name).includes(foldTr(q)) || foldTr(item.zone).includes(foldTr(q)),
    )
  }, [illerQuery])

  const localPlaces = useMemo(() => {
    const list = places.filter((place) => {
      if (tourProvince && place.region !== tourProvince) return false
      if (!HAS_LAND && tourZone && place.zone && place.zone !== tourZone) return false
      return true
    })
    if (HAS_LAND) return list
    return [...list].filter((place) => hasPlacePhoto(place) || HAS_TOUR).slice(0, 10)
  }, [places, tourProvince, tourZone])

  const provincePlaces = useMemo(() => {
    if (!HAS_LAND || !tourProvince) return localPlaces
    return mergePlaces(localPlaces, live.filter((item) => item.region === tourProvince))
  }, [localPlaces, live, tourProvince])

  const grouped = useMemo(() => {
    return LAND_BUCKETS.map((bucket) => ({
      ...bucket,
      items: provincePlaces.filter((place) => landBucket(place) === bucket.id),
    })).filter((bucket) => bucket.items.length > 0)
  }, [provincePlaces])

  const cover = useMemo(() => {
    const withPhoto = provincePlaces.find((place) => hasPlacePhoto(place))
    return withPhoto ? placeCover(withPhoto) : ''
  }, [provincePlaces])

  function pickProvince(name: string) {
    const zone = zoneOfProvince(name)
    setTourProvince(name)
    setTourZone(zone ?? null)
    setIllerQuery(name)
    setGeoPick({ province: name })
    setQuery('')
  }

  function clearProvince() {
    setTourProvince('')
    setTourZone(null)
    setIllerQuery('')
    setGeoPick(null)
  }

  return (
    <div className={HAS_LAND ? 'home is-land' : 'home'}>
      {HAS_LAND ? (
        <section className="land-hero" aria-label="Türkiye">
          <TurkeyMap
            province={tourProvince || null}
            places={tourProvince ? provincePlaces : []}
            onSelectProvince={(name) => {
              if (!name) clearProvince()
              else pickProvince(name)
            }}
          />
          <aside className="land-panel">
            <p className="home-kicker">Türkiye</p>
            <h1>{tourProvince || 'İl il bak'}</h1>
            <p className="land-lede">
              {tourProvince
                ? `${tourProvince} seçili. Mesire, müze, orman, sahil ve gezilecek yerler aşağıda.`
                : 'Haritadan ile tıkla ya da İller sekmesini aç. Kamp ve yürüyüş ayrı durur.'}
            </p>
            <div className="home-cta">
              <Link className="btn-fill" to="/parkurlar">
                Parkurlar
                {routeStatus === 'ready' ? ` · ${formatInt(routes.length)}` : ''}
              </Link>
              <Link className="btn-ghost" to="/kamp">
                Kamp
                {placeStatus === 'ready' ? ` · ${formatInt(places.length)}` : ''}
              </Link>
            </div>
            <div className="iller-tab">
              <button
                type="button"
                className={illerOpen ? 'iller-toggle is-on' : 'iller-toggle'}
                aria-expanded={illerOpen}
                onClick={() => setIllerOpen((value) => !value)}
              >
                İller
              </button>
              {illerOpen && (
                <div className="iller-box">
                  <label className="iller-search">
                    <span className="sr-only">İl adı</span>
                    <input
                      type="search"
                      value={illerQuery}
                      placeholder="İl adı yaz — Adana, Muş, Muğla"
                      onChange={(event) => {
                        const next = event.target.value
                        setIllerQuery(next)
                        const exact = PROVINCES.find((item) => foldTr(item.name) === foldTr(next.trim()))
                        if (exact) pickProvince(exact.name)
                      }}
                    />
                  </label>
                  <ul className="iller-list" role="listbox" aria-label="İller">
                    {filteredIller.length === 0 && <li className="tour-empty">Bu ada uyan il yok.</li>}
                    {filteredIller.map((item) => (
                      <li key={item.name}>
                        <button
                          type="button"
                          className={tourProvince === item.name ? 'is-on' : undefined}
                          onClick={() => pickProvince(item.name)}
                        >
                          <strong>{item.name}</strong>
                          <span>{ZONE_SHORT[item.zone]}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {tourProvince && (
              <p className="land-count">
                {formatInt(provincePlaces.length)} yer
                {liveStatus === 'loading' ? ' · OSM yükleniyor' : ''}
                {liveStatus === 'error' ? ' · OSM alınamadı, çekirdek kayıt duruyor' : ''}
                {liveStatus === 'ready' ? ` · ${formatInt(live.length)} OSM/Wiki` : ''}
              </p>
            )}
          </aside>
        </section>
      ) : (
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="home-kicker">Türkiye</p>
            <h1>Kamp ve yürüyüş</h1>
            <p className="home-lede">
              {HAS_TOUR
                ? 'Aşağıda il il bak: nerede ne var. Kamp veya yürüyüşe o kartlardan gir.'
                : 'Parkurlar, milli park kampları ve yerinde Wikimedia fotoğrafları. Girişte harita yok; liste ve harita Parkurlar veya Kamp’a girince açılır.'}
            </p>
            <div className="home-cta">
              <Link className="btn-fill" to="/parkurlar">
                Parkurlar
                {routeStatus === 'ready' ? ` · ${formatInt(routes.length)}` : ''}
              </Link>
              <Link className="btn-ghost" to="/kamp">
                Kamp alanları
                {placeStatus === 'ready' ? ` · ${formatInt(places.length)}` : ''}
              </Link>
            </div>
          </div>
          {mosaic.length > 0 && (
            <div className="home-mosaic" aria-hidden="true">
              {mosaic.map((src, index) => (
                <img key={`${index}-${src}`} src={sharpUrl(src, 720)} alt="" referrerPolicy="no-referrer" />
              ))}
            </div>
          )}
        </section>
      )}

      {HAS_LAND && tourProvince && (
        <section className="land-board" aria-label={`${tourProvince} gezilecek yerler`}>
          {cover ? (
            <div className="land-cover">
              <img src={sharpUrl(cover, 1400)} alt="" referrerPolicy="no-referrer" />
              <div>
                <p className="home-kicker">{zoneOfProvince(tourProvince)}</p>
                <h2>{tourProvince}</h2>
                <p>Bu ilde mesire, müze, orman, sahil ve gezilecek kayıtlı yerler.</p>
              </div>
            </div>
          ) : (
            <div className="home-section-head">
              <h2>{tourProvince}</h2>
              <button type="button" className="linkish" onClick={clearProvince}>
                Türkiye’ye dön
              </button>
            </div>
          )}
          {grouped.length === 0 && (
            <p className="tour-empty">Bu ilde henüz çekirdek kayıt yok; OSM yüklenince listelenir.</p>
          )}
          {grouped.map((bucket) => (
            <div key={bucket.id} className="land-group">
              <h3>
                {bucket.label}
                <span>{formatInt(bucket.items.length)}</span>
              </h3>
              <ul className="land-places">
                {bucket.items.map((place) => {
                  const image = placeCover(place)
                  return (
                    <li key={place.id}>
                      <Link className="land-place" to={`/kamp/${place.id}`}>
                        {image ? (
                          <img src={sharpUrl(image, 480)} alt="" referrerPolicy="no-referrer" />
                        ) : (
                          <TrailThumb seed={place.id} />
                        )}
                        <span>
                          <strong>{place.title}</strong>
                          <em>
                            {place.statusLabel ?? PLACE_KIND_LABELS[place.kind]} · {place.city}
                          </em>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </section>
      )}

      {HAS_TOUR && !HAS_LAND && (
        <section className="tour-board" aria-label="Geziyorum görüyorum">
          <div className="home-section-head">
            <h2>Geziyorum, görüyorum</h2>
            <Link to="/kamp">Haritada aç</Link>
          </div>
          <p className="tour-lede">Türkiye’de il il bak. Bölge seç, ili seç; o ilde ne olduğu listelenir. Kamp ve yürüyüş ayrı durur.</p>
          <div className="tour-zones" role="group" aria-label="Bölge">
            <button
              type="button"
              className={!tourZone ? 'is-on' : undefined}
              onClick={() => {
                setTourZone(null)
                setTourProvince('')
              }}
            >
              Tüm Türkiye
            </button>
            {CATALOG_ZONES.map((item) => (
              <button
                key={item}
                type="button"
                className={tourZone === item ? 'is-on' : undefined}
                onClick={() => {
                  setTourZone(item)
                  setTourProvince('')
                }}
              >
                {ZONE_SHORT[item]}
              </button>
            ))}
          </div>
          <div className="tour-provinces" role="list">
            {tourProvinces.map((item) => (
              <button
                key={item.name}
                type="button"
                className={tourProvince === item.name ? 'is-on' : undefined}
                onClick={() => {
                  setTourProvince(item.name)
                  setTourZone(item.zone)
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
          <ul className="tour-places">
            {localPlaces.length === 0 && <li className="tour-empty">Bu ilde henüz çekirdek kayıt yok; Kamp’ta OSM katmanı açılır.</li>}
            {localPlaces.map((place) => {
              const image = placeCover(place)
              return (
                <li key={place.id}>
                  <button
                    type="button"
                    className="tour-place"
                    onClick={() => {
                      setGeoPick({ province: place.region, district: place.district || place.city })
                      setQuery('')
                      navigate('/kamp')
                    }}
                  >
                    {image ? (
                      <img src={sharpUrl(image, 480)} alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <TrailThumb seed={place.id} />
                    )}
                    <span>
                      <strong>{place.title}</strong>
                      <em>
                        {place.city} · {place.region}
                      </em>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="home-section">
        <div className="home-section-head">
          <h2>Yürüyüş parkurları</h2>
          <Link to="/parkurlar">Tümünü gör</Link>
        </div>
        <ul className="home-grid">
          {trailPicks.map((route) => (
            <li key={route.id}>
              <Link className="home-card" to={`/rota/${route.id}`}>
                <img className="home-card-img" src={sharpUrl(route.image, 720)} alt="" referrerPolicy="no-referrer" />
                <div className="home-card-body">
                  <h3>{route.title}</h3>
                  <p>
                    {ACTIVITY_LABELS[route.activity]} · {formatKm(route.distanceKm)} km · {route.city}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <h2>Kamp alanları</h2>
          <Link to="/kamp">Tümünü gör</Link>
        </div>
        <ul className="home-grid">
          {campPicks.map((place) => {
            const image = placeCover(place)
            return (
              <li key={place.id}>
                <Link className="home-card" to={`/kamp/${place.id}`}>
                  {image ? (
                    <img className="home-card-img" src={sharpUrl(image, 720)} alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <TrailThumb seed={place.id} />
                  )}
                  <div className="home-card-body">
                    <h3>{place.title}</h3>
                    <p>
                      {PLACE_KIND_LABELS[place.kind]} · {place.region}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="home-about">
        <h2>Site hakkında</h2>
        <p>
          Yürüyom, Türkiye’deki yürüyüş parkurlarını ve DKMP kamp alanlarını bir arada gösterir.
          Ana sayfada Türkiye haritasından ile bakılır; Kamp ve Yürüyüş ayrı girilir. Kapaklar Wikimedia
          Commons; stok Unsplash yok. Harita OpenStreetMap üzerindedir. Pindeki yer izin değildir.
        </p>
        <ul className="home-facts">
          <li>
            <b>{formatInt(routes.length)}</b>
            <span>GPS parkur</span>
          </li>
          <li>
            <b>{formatInt(places.length)}</b>
            <span>Kamp / park kaydı</span>
          </li>
          <li>
            <b>Telifsiz</b>
            <span>Yerinde kare, stok yok</span>
          </li>
        </ul>
      </section>
    </div>
  )
}
