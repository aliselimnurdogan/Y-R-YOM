import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { featuredScore, formatInt, formatKm, hasPlacePhoto, placeCover } from '../format'
import { ACTIVITY_LABELS, CATALOG_ZONES, PLACE_KIND_LABELS, ZONE_SHORT, type CatalogZone } from '../labels'
import { sharpUrl } from '../media'
import { PROVINCES } from '../provinces'
import { usePlaces } from '../places-context'
import { useRoutes } from '../routes-context'
import { useSearch } from '../search-context'
import { HAS_GATE, HAS_LAND, HAS_TOUR, TOUR_PATH } from '../step'
import { TrailThumb } from './Brand'
import { TourPage } from './TourPage'

export function HomePage() {
  const { status: routeStatus, routes } = useRoutes()
  const { status: placeStatus, places } = usePlaces()
  const { setGeoPick, setQuery } = useSearch()
  const navigate = useNavigate()
  const [tourZone, setTourZone] = useState<CatalogZone | null>(null)
  const [tourProvince, setTourProvince] = useState('')

  useEffect(() => {
    document.title = 'Yürüyom'
  }, [])

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

  const localPlaces = useMemo(() => {
    const list = places.filter((place) => {
      if (tourProvince && place.region !== tourProvince) return false
      if (tourZone && place.zone && place.zone !== tourZone) return false
      return true
    })
    return [...list].filter((place) => hasPlacePhoto(place) || HAS_TOUR).slice(0, 10)
  }, [places, tourProvince, tourZone])

  if (HAS_GATE) {
    return (
      <div className="home is-gate">
        <section className="gate-hero" aria-label="Yürüyom">
          <div className="gate-copy">
            <p className="home-kicker">Türkiye</p>
            <h1>Yürüyom</h1>
            <div className="gate-block">
              <h2>Sitemiz nedir</h2>
              <p>
                Yürüyom, Türkiye’de yürüyüş parkurlarını ve kamp alanlarını bir arada gösteren bir sitedir. Satış
                yok, rezervasyon yok. Giriş hesabı yok. Pin izin değildir; haritadaki nokta geceleme hakkı vermez.
              </p>
            </div>
            <div className="gate-block">
              <h2>Ne yapıyor</h2>
              <p>
                İl il bakılır: o ilde mesire, orman, sahil, müze ve gezilecek kayıt durur. Kamp sayfasında milli park
                ve OSM yerleri; yürüyüşte GPS parkurlar. Kapaklar Wikimedia Commons, harita OpenStreetMap. Stok
                Unsplash ve uydurma yorum yok.
              </p>
            </div>
            <div className="gate-block">
              <h2>Ne amaçla</h2>
              <p>
                Nereye gidilir, orada ne var, geceleme neresinde tahsisli — bunu net göstermek. Kişi il seçer, yerin
                adını açar, başkasının notuna bakar. “Kampa gideceğim” diye sorarsa sohbet bu tarayıcıda kalır;
                sunucuya gitmez.
              </p>
            </div>
          </div>
          <aside className="gate-side" aria-label="Bölümler">
            <Link className="gate-card" to={TOUR_PATH}>
              <strong>Geziyorum görüyorum</strong>
              <span>81 il, sabit Türkiye. İle tıkla; yer isimleri altta.</span>
            </Link>
            <Link className="gate-card" to="/kamp">
              <strong>Kamp</strong>
              <span>Milli park, yayla, tahsisli alan. Amaç seç, haritada bak.</span>
            </Link>
            <Link className="gate-card" to="/parkurlar">
              <strong>Yürüyüş</strong>
              <span>GPS parkurlar. Mesafesi, izi, yerinde kapak.</span>
            </Link>
          </aside>
        </section>
      </div>
    )
  }

  if (HAS_LAND) return <TourPage />

  return (
    <div className="home">
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

      {HAS_TOUR && (
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
