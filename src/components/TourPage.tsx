import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { provinceCenter } from '../admin-geo'
import { foldTr, formatInt, hasPlacePhoto, placeCover } from '../format'
import { PLACE_KIND_LABELS } from '../labels'
import { sharpUrl } from '../media'
import { fetchOsmCamps, fetchWikiGeo, fetchWikiProvince, mergePlaces } from '../overpass'
import { fallbackProvinceNote, trimExtract } from '../province-notes'
import { PROVINCES, zoneOfProvince } from '../provinces'
import { usePlaces } from '../places-context'
import { useSearch } from '../search-context'
import type { PlaceItem } from '../types'
import { ProvinceTalk } from './ProvinceTalk'
import { TurkeyMap } from './TurkeyMap'

export function TourPage() {
  const { places } = usePlaces()
  const { setGeoPick, setQuery } = useSearch()
  const [tourProvince, setTourProvince] = useState('')
  const [illerQuery, setIllerQuery] = useState('')
  const [live, setLive] = useState<PlaceItem[]>([])
  const [liveStatus, setLiveStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [wiki, setWiki] = useState({ extract: '', image: '' })

  useEffect(() => {
    document.title = 'Geziyorum görüyorum · Yürüyom'
  }, [])

  useEffect(() => {
    if (!tourProvince) {
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

  const filteredIller = useMemo(() => {
    const q = illerQuery.trim()
    const list = q
      ? PROVINCES.filter(
          (item) => foldTr(item.name).includes(foldTr(q)) || foldTr(item.zone).includes(foldTr(q)),
        )
      : PROVINCES
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'tr'))
  }, [illerQuery])

  const localPlaces = useMemo(
    () => places.filter((place) => !tourProvince || place.region === tourProvince),
    [places, tourProvince],
  )

  const provincePlaces = useMemo(() => {
    if (!tourProvince) return localPlaces
    return mergePlaces(
      localPlaces,
      live.filter((item) => item.region === tourProvince),
    )
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
    setTourProvince(name)
    setGeoPick({ province: name })
    setQuery('')
    window.setTimeout(() => {
      document.querySelector('.land-board')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  function clearProvince() {
    setTourProvince('')
    setIllerQuery('')
    setGeoPick(null)
  }

  return (
    <div className="home is-land">
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

      {tourProvince && (
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
    </div>
  )
}
