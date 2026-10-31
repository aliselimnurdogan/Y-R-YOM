import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { provinceCenter } from '../admin-geo'
import { foldTr, formatInt, hasPlacePhoto, placeCover } from '../format'
import { GEZI_NOTE, groupGeziPlaces, isGeziPlace } from '../gezi'
import { PLACE_KIND_LABELS } from '../labels'
import { sharpUrl } from '../media'
import { fetchOsmCamps, fetchWikiGeo, fetchWikiProvince, mergePlaces } from '../overpass'
import { fallbackProvinceNote, trimExtract } from '../province-notes'
import { PROVINCES, zoneOfProvince } from '../provinces'
import { usePlaces } from '../places-context'
import { useSearch } from '../search-context'
import { HAS_GEZI, HAS_GUIDE } from '../step'
import type { PlaceItem } from '../types'
import { ProvinceMarket } from './ProvinceMarket'
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

  const geziGroups = useMemo(() => (HAS_GEZI ? groupGeziPlaces(namedPlaces) : []), [namedPlaces])

  const geziByIl = useMemo(() => {
    const map = new Map<string, number>()
    if (!HAS_GEZI) return map
    for (const place of places) {
      if (!isGeziPlace(place)) continue
      map.set(place.region, (map.get(place.region) ?? 0) + 1)
    }
    return map
  }, [places])

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
      <section className="land-hero" aria-label="Türkiye">
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
            {filteredIller.map((item) => {
              const n = geziByIl.get(item.name) ?? 0
              return (
                <li key={item.name}>
                  <button
                    type="button"
                    className={tourProvince === item.name ? 'is-on' : undefined}
                    onClick={() => pickProvince(item.name)}
                  >
                    {item.name}
                    {HAS_GEZI && n > 0 ? <em>{formatInt(n)}</em> : null}
                  </button>
                </li>
              )
            })}
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
          {HAS_GUIDE && <ProvinceMarket province={tourProvince} />}
          {HAS_GEZI && (
            <p className="land-note">
              Tarihî yer, müze, tiyatro ve doğal alan kayıtları elle derlendi. {GEZI_NOTE}
            </p>
          )}
          <h3 className="land-names-head">
            {formatInt(namedPlaces.length)} yer
            {liveStatus === 'loading' ? ' · yükleniyor' : ''}
          </h3>
          {namedPlaces.length === 0 ? (
            <p className="tour-empty">
              {HAS_GEZI
                ? 'Bu ilde elle derlenmiş gezi kaydı yok; OSM gelince isimler burada durur.'
                : 'Bu ilde henüz kayıt yok; OSM gelince isimler burada durur.'}
            </p>
          ) : HAS_GEZI ? (
            geziGroups.map((group) => (
              <section key={group.label} className="land-group" aria-label={group.label}>
                <h4>
                  {group.label}
                  <span>
                    {formatInt(group.districts.reduce((sum, district) => sum + district.items.length, 0))}
                  </span>
                </h4>
                {group.districts.map((district) => (
                  <div key={`${group.label}-${district.name}`}>
                    <p className="land-district">{district.name}</p>
                    <ul className="land-names">
                      {district.items.map((place) => (
                        <li key={place.id}>
                          <Link to={`/kamp/${place.id}`}>
                            {place.title}
                            <span>{place.statusLabel ?? PLACE_KIND_LABELS[place.kind]}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            ))
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
