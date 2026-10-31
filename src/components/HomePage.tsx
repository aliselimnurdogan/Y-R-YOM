import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { provinceCenter } from '../admin-geo'
import { featuredScore, foldTr, formatInt, formatKm, hasPlacePhoto, placeCover } from '../format'
import { ACTIVITY_LABELS, CATALOG_ZONES, PLACE_KIND_LABELS, ZONE_SHORT, type CatalogZone } from '../labels'
import { sharpUrl } from '../media'
import { fetchOsmCamps, fetchWikiGeo, fetchWikiProvince, mergePlaces } from '../overpass'
import { fallbackProvinceNote, trimExtract } from '../province-notes'
import { PROVINCES, zoneOfProvince } from '../provinces'
import { usePlaces } from '../places-context'
import { useRoutes } from '../routes-context'
import { useSearch } from '../search-context'
import { HAS_LAND, HAS_TOUR } from '../step'
import type { PlaceItem } from '../types'
import { TrailThumb } from './Brand'
import { ProvinceTalk } from './ProvinceTalk'
import { TurkeyMap } from './TurkeyMap'

export function HomePage() {
  const { status: routeStatus, routes } = useRoutes()
  const { status: placeStatus, places } = usePlaces()
  const { setGeoPick, setQuery } = useSearch()
  const navigate = useNavigate()
  const [tourZone, setTourZone] = useState<CatalogZone | null>(null)
  const [tourProvince, setTourProvince] = useState('')
  const [illerQuery, setIllerQuery] = useState('')
  const [live, setLive] = useState<PlaceItem[]>([])
  const [liveStatus, setLiveStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [wiki, setWiki] = useState({ extract: '', image: '' })

  useEffect(() => {
    document.title = 'Yürüyom'
  }, [])

  useEffect(() => {
    if (!HAS_LAND || !tourProvince) {
      setLive([])
      setWiki({ extract: '', image: '' })
      setLiveStatus('idle')
      return
    }
    let alive = true
    setLiveStatus('loading')
    const center = provinceCenter(tourProvince)
    void fetchWikiProvince(tourProvince).then((page) => {
      if (alive) setWiki(page)
    })
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
    const list = q
      ? PROVINCES.filter(
          (item) => foldTr(item.name).includes(foldTr(q)) || foldTr(item.zone).includes(foldTr(q)),
        )
      : PROVINCES
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'tr'))
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

  const namedPlaces = useMemo(
    () => [...provincePlaces].sort((a, b) => a.title.localeCompare(b.title, 'tr')),
    [provincePlaces],
  )

  const cover = useMemo(() => {
    if (wiki.image) return wiki.image
    const withPhoto = provincePlaces.find((place) => hasPlacePhoto(place))
    return withPhoto ? placeCover(withPhoto) : ''
  }, [provincePlaces, wiki.image])

  const about = wiki.extract ? trimExtract(wiki.extract) : fallbackProvinceNote(tourProvince)

  function pickProvince(name: string) {
    const zone = zoneOfProvince(name)
    setTourProvince(name)
    setTourZone(zone ?? null)
    setGeoPick({ province: name })
    setQuery('')
    window.setTimeout(() => {
      document.querySelector('.land-board')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
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
        <section className={tourProvince ? 'land-hero has-il' : 'land-hero'} aria-label="Türkiye">
          <aside className="land-panel">
            <p className="iller-title">İller</p>
            <label className="iller-search">
              <span className="sr-only">İl ara</span>
              <input
                type="search"
                value={illerQuery}
                placeholder="Ara"
                onChange={(event) => setIllerQuery(event.target.value)}
              />
            </label>
            <ul className="iller-list" role="listbox" aria-label="İller A’dan Z’ye">
              {filteredIller.length === 0 && <li className="tour-empty">Bu ada uyan il yok.</li>}
              {filteredIller.map((item) => (
                <li key={item.name}>
                  <button
                    type="button"
                    className={tourProvince === item.name ? 'is-on' : undefined}
                    onClick={() => pickProvince(item.name)}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <TurkeyMap
            province={tourProvince || null}
            onSelectProvince={(name) => {
              if (!name) clearProvince()
              else pickProvince(name)
            }}
          />
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
          <p className="land-about">
            {about}
            {wiki.extract ? ' Kaynak: Türkçe Wikipedia.' : ''}
          </p>
          <h3 className="land-names-head">
            {formatInt(namedPlaces.length)} yer
            {liveStatus === 'loading' ? ' · yükleniyor' : ''}
          </h3>
          {namedPlaces.length === 0 ? (
            <p className="tour-empty">Bu ilde henüz kayıt yok; OSM gelince isimler burada durur.</p>
          ) : (
            <ul className="land-names">
              {namedPlaces.map((place) => (
                <li key={place.id}>
                  <Link to={`/kamp/${place.id}`}>
                    {place.title}
                    <span>{place.statusLabel ?? PLACE_KIND_LABELS[place.kind]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <ProvinceTalk province={tourProvince} />
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

      {!HAS_LAND && (
        <>
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
        </>
      )}
    </div>
  )
}
