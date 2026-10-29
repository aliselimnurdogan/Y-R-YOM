import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { featuredScore, formatInt, formatKm, hasPlacePhoto, placeCover } from '../format'
import { ACTIVITY_LABELS, PLACE_KIND_LABELS } from '../labels'
import { sharpUrl } from '../media'
import { usePlaces } from '../places-context'
import { useRoutes } from '../routes-context'
import { TrailThumb } from './Brand'

export function HomePage() {
  const { status: routeStatus, routes } = useRoutes()
  const { status: placeStatus, places } = usePlaces()

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
  ].filter(Boolean).slice(0, 4)

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-kicker">Türkiye</p>
          <h1>Kamp ve yürüyüş</h1>
          <p className="home-lede">
            Parkurlar, milli park kampları ve yerinde Wikimedia fotoğrafları. Girişte harita yok;
            liste ve harita Parkurlar veya Kamp’a girince açılır.
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
              <img key={`${index}-${src}`} src={sharpUrl(src, 720)} alt="" />
            ))}
          </div>
        )}
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <h2>Yürüyüş parkurları</h2>
          <Link to="/parkurlar">Tümünü gör</Link>
        </div>
        <ul className="home-grid">
          {trailPicks.map((route) => (
            <li key={route.id}>
              <Link className="home-card" to={`/rota/${route.id}`}>
                <img className="home-card-img" src={sharpUrl(route.image, 720)} alt="" />
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
            const cover = placeCover(place)
            return (
              <li key={place.id}>
                <Link className="home-card" to={`/kamp/${place.id}`}>
                  {cover ? (
                    <img className="home-card-img" src={sharpUrl(cover, 720)} alt="" />
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
          Kapaklar Wikimedia Commons; stok Unsplash yok. Harita OpenStreetMap üzerindedir. Pindeki
          yer izin değildir; ormanda geceleme yalnız belirlenmiş konak yerinde.
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
