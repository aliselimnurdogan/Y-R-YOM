import { useEffect, useId, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { compressPhoto, loadComments, saveComment } from '../community'
import { formatDate, formatFee, formatInt, initials } from '../format'
import { LEGAL_CAMP_NOTE, PLACE_KIND_COLORS, PLACE_KIND_LABELS } from '../labels'
import { srcSet, sharpUrl } from '../media'
import { appleDir, googleDir, googlePano, yandexDir } from '../nav'
import { usePlaces } from '../places-context'
import { useSearch } from '../search-context'
import { APP_STEP, HAS_CATALOG, HAS_FEEL, HAS_LIVE, HAS_POLISH, HAS_SOCIAL } from '../step'
import type { PlaceComment, PlaceItem, PlaceScores } from '../types'
import { fetchWeather, type PlaceWeather } from '../weather'
import { TrailThumb } from './Brand'
import { CampGuideBlock } from './CampGuideBlock'
import { DetailMap } from './DetailMap'
import { FeelThereBlock } from './FeelThereBlock'

export function DetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { status, places, reload } = usePlaces()
  const { setQuery } = useSearch()
  const place = places.find((item) => item.id === id) ?? null
  const [photoIndex, setPhotoIndex] = useState(0)
  const homePath = APP_STEP === '2' ? '/' : '/kamp'
  const homeLabel = APP_STEP === '2' ? 'Kahramanmaraş' : 'Kamp alanları'

  useEffect(() => {
    setPhotoIndex(0)
  }, [id])

  useEffect(() => {
    document.title = place ? `${place.title} · Yürüyom` : 'Yürüyom'
  }, [place])

  if (status === 'loading') {
    return (
      <div className="detail">
        <p className="empty-note">Alan yükleniyor…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="detail">
        <div className="empty-note">
          <p>Alanlar yüklenemedi</p>
          <button type="button" className="btn-ghost" onClick={reload}>
            Tekrar dene
          </button>
        </div>
      </div>
    )
  }

  if (!place) {
    return (
      <div className="detail">
        <h1>Alan bulunamadı</h1>
        <p className="lede">Bu yer listede yok.</p>
        <Link className="btn-ghost stack-gap" to={homePath}>
          Alanlara dön
        </Link>
      </div>
    )
  }

  const currentImage = place.images[photoIndex] ?? place.images[0]

  return (
    <article className="detail">
      <nav className="crumb" aria-label="Konum">
        <Link
          to={homePath}
          onClick={() => {
            setQuery('')
          }}
        >
          {homeLabel}
        </Link>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => {
            setQuery(place.region)
            navigate(homePath)
          }}
        >
          {place.region}
        </button>
      </nav>
      <h1>{place.title}</h1>
      <div className="author-row">
        <span className="chip" style={{ background: `${PLACE_KIND_COLORS[place.kind]}22`, color: PLACE_KIND_COLORS[place.kind] }}>
          {place.statusLabel ?? PLACE_KIND_LABELS[place.kind]}
        </span>
        <span className="act-name">{place.city}</span>
        <span className="chip">{formatInt(place.elevationM)} m</span>
        {HAS_CATALOG && <span className="chip">{formatFee(place.feeTent)}</span>}
        <div className="actions">
          <Link className="btn-ghost" to={homePath}>
            Geri
          </Link>
        </div>
      </div>
      <p className="lede place-lede">{place.summary}</p>
      {HAS_FEEL && <FeelThereBlock place={place} />}
      {HAS_LIVE && <WeatherNavBlock place={place} />}
      {HAS_CATALOG && place.guide && <CampGuideBlock place={place} />}
      {HAS_CATALOG && (
        <dl className="fact-grid">
          <div>
            <dt>Tür</dt>
            <dd>{place.statusLabel ?? PLACE_KIND_LABELS[place.kind]}</dd>
          </div>
          <div>
            <dt>İl</dt>
            <dd>
              {place.region}
              {place.city ? ` / ${place.city}` : ''}
            </dd>
          </div>
          <div>
            <dt>Bölge</dt>
            <dd>{place.zone ?? '—'}</dd>
          </div>
          <div>
            <dt>Rakım</dt>
            <dd>{formatInt(place.elevationM)} m</dd>
          </div>
          <div>
            <dt>Alan</dt>
            <dd>{place.areaHa && place.areaHa > 0 ? `${formatInt(place.areaHa)} ha` : '—'}</dd>
          </div>
          <div>
            <dt>2026 çadır</dt>
            <dd>{place.feeTent == null ? 'Tarife eşleşmedi' : `${formatFee(place.feeTent)} / gece, 4 kişilik`}</dd>
          </div>
        </dl>
      )}
      {currentImage ? (
        <div className="gallery">
          <img
            className="gallery-main"
            src={sharpUrl(currentImage, 1920)}
            srcSet={srcSet(currentImage, [960, 1440, 1920])}
            sizes="(max-width: 860px) 100%, 1100px"
            alt={place.title}
          />
          <div className="gallery-thumbs" role="list">
            {place.images.map((image, index) => (
              <button
                key={image}
                type="button"
                className={index === photoIndex ? 'is-on' : undefined}
                aria-label={`${index + 1}. fotoğraf`}
                aria-current={index === photoIndex ? 'true' : undefined}
                onClick={() => setPhotoIndex(index)}
              >
                <img
                  src={sharpUrl(image, 480)}
                  srcSet={srcSet(image, [240, 480])}
                  sizes="96px"
                  alt=""
                  width={96}
                  height={68}
                />
              </button>
            ))}
          </div>
          {HAS_CATALOG && <p className="photo-credit">Fotoğraflar Wikimedia Commons, yerinde çekilmiş kareler.</p>}
        </div>
      ) : HAS_POLISH ? (
        <>
          <div className="cover trail-cover" aria-hidden="true">
            <TrailThumb seed={place.id} />
          </div>
          <p className="empty-photo">Yerinde Wikimedia fotoğrafı yok; stok görsel konmadı.</p>
        </>
      ) : (
        HAS_CATALOG && (
          <p className="empty-photo">Bu park için yerinde Wikimedia fotoğrafı henüz yok; temsili görsel kullanılmadı.</p>
        )
      )}
      {HAS_LIVE && <PovBlock place={place} />}
      {!HAS_LIVE && place.videos.length > 0 && (
        <section className="video-block">
          <h2 className="section-title">Kısa videolar</h2>
          <div className="video-grid">
            {place.videos.map((video) => (
              <figure key={video.youtubeId} className="video-card">
                <div className="video-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <figcaption>{video.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      <DetailMap place={place} />
      {HAS_CATALOG && <p className="legal-note">{LEGAL_CAMP_NOTE}</p>}
      {HAS_SOCIAL && <Comments place={place} />}
    </article>
  )
}

function WeatherNavBlock({ place }: { place: PlaceItem }) {
  const [weather, setWeather] = useState<PlaceWeather | null>(null)
  const [weatherError, setWeatherError] = useState(false)

  useEffect(() => {
    let alive = true
    setWeather(null)
    setWeatherError(false)
    void fetchWeather(place.lat, place.lng)
      .then((item) => {
        if (alive) setWeather(item)
      })
      .catch(() => {
        if (alive) setWeatherError(true)
      })
    return () => {
      alive = false
    }
  }, [place.id, place.lat, place.lng])

  return (
    <section className="live-tools">
      <div className="weather-card">
        <h2 className="section-title">Canlı hava</h2>
        {weatherError && <p className="muted">Hava alınamadı; Open-Meteo’yu sonra dene.</p>}
        {!weatherError && !weather && <p className="muted">Hava yükleniyor…</p>}
        {weather && (
          <dl className="fact-grid weather-grid">
            <div>
              <dt>Sıcaklık</dt>
              <dd>{Math.round(weather.temp)}°</dd>
            </div>
            <div>
              <dt>Hissedilen</dt>
              <dd>{Math.round(weather.feels)}°</dd>
            </div>
            <div>
              <dt>Rüzgar</dt>
              <dd>{Math.round(weather.wind)} km/s</dd>
            </div>
            <div>
              <dt>Yağış</dt>
              <dd>%{Math.round(weather.rain)}</dd>
            </div>
            <div>
              <dt>Bulut</dt>
              <dd>%{Math.round(weather.cloud)}</dd>
            </div>
            <div>
              <dt>Gece gökyüzü</dt>
              <dd>{weather.label}</dd>
            </div>
          </dl>
        )}
      </div>
      <div className="nav-links">
        <a className="btn-fill" href={googleDir(place.lat, place.lng)} target="_blank" rel="noreferrer">
          Google yol tarifi
        </a>
        <a className="btn-ghost" href={yandexDir(place.lat, place.lng)} target="_blank" rel="noreferrer">
          Yandex
        </a>
        <a className="btn-ghost" href={appleDir(place.lat, place.lng)} target="_blank" rel="noreferrer">
          Apple Haritalar
        </a>
        <a className="btn-ghost" href={googlePano(place.lat, place.lng)} target="_blank" rel="noreferrer">
          Sokak görünümü
        </a>
      </div>
      <p className="muted">Sokak görünümü Google Haritalar’da açılır; içerik çekilmez.</p>
    </section>
  )
}

function PovBlock({ place }: { place: PlaceItem }) {
  return (
    <section className="video-block">
      <h2 className="section-title">Canlı doğa atmosferi (HD / POV)</h2>
      {place.videos.length > 0 ? (
        <div className="video-grid">
          {place.videos.map((video) => (
            <figure key={video.youtubeId || video.src} className="video-card">
              <div className="video-frame">
                {video.src ? (
                  <video src={video.src} controls playsInline />
                ) : video.youtubeId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : null}
              </div>
              <figcaption>{video.title}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="empty-photo">Bu yer için kayıtlı POV video henüz yok; uydurma film konmadı.</p>
      )}
    </section>
  )
}

function Comments({ place }: { place: PlaceItem }) {
  const photoId = useId()
  const [comments, setComments] = useState<PlaceComment[]>(() => loadComments(place.id))
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [scores, setScores] = useState<PlaceScores>({ nature: 4, clean: 3, access: 3, safety: 4 })

  useEffect(() => {
    setComments(loadComments(place.id))
    setName('')
    setText('')
    setPhoto(undefined)
    setError('')
  }, [place.id])

  async function onPhoto(file: File | undefined) {
    setError('')
    if (!file) {
      setPhoto(undefined)
      return
    }
    try {
      setBusy(true)
      setPhoto(await compressPhoto(file))
    } catch (caught) {
      setPhoto(undefined)
      setError(caught instanceof Error ? caught.message : 'Fotoğraf yüklenemedi.')
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedText = text.trim()
    if (trimmedName.length < 2) {
      setError('İsim en az 2 karakter olsun.')
      return
    }
    if (trimmedText.length < 3) {
      setError('Yorum biraz daha uzun olsun.')
      return
    }
    const comment: PlaceComment = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      placeId: place.id,
      name: trimmedName.slice(0, 40),
      text: trimmedText.slice(0, 600),
      photo,
      createdAt: new Date().toISOString(),
      scores: HAS_LIVE ? { ...scores } : undefined,
    }
    setComments(saveComment(comment))
    setText('')
    setPhoto(undefined)
    setError('')
  }

  return (
    <section className="comments">
      <h2 className="section-title">Yorumlar ve fotoğraflar</h2>
      <p className="muted comment-hint">
        Bu tarayıcıda kalır. Sunucuya gönderilmez; fotoğrafını ve notunu buradan paylaşabilirsin.
      </p>
      <form className="comment-form" onSubmit={onSubmit}>
        <label>
          İsmin
          <input
            value={name}
            maxLength={40}
            autoComplete="nickname"
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label>
          Yorumun
          <textarea
            value={text}
            maxLength={600}
            rows={4}
            placeholder={`${place.title} nasıl bir yerdi?`}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        {HAS_LIVE && (
          <div className="score-row">
            {(
              [
                ['nature', 'Doğa'],
                ['clean', 'Temizlik'],
                ['access', 'Ulaşım'],
                ['safety', 'Güvenlik'],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                {label}
                <select
                  value={scores[key]}
                  onChange={(event) => setScores((current) => ({ ...current, [key]: Number(event.target.value) }))}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
        <div className="comment-tools">
          <label className="photo-pick" htmlFor={photoId}>
            Fotoğraf ekle
            <input
              id={photoId}
              type="file"
              accept="image/*"
              onChange={(event) => void onPhoto(event.target.files?.[0])}
            />
          </label>
          {photo && (
            <button type="button" className="linkish" onClick={() => setPhoto(undefined)}>
              Fotoğrafı kaldır
            </button>
          )}
          <button type="submit" className="btn-fill" disabled={busy}>
            Paylaş
          </button>
        </div>
        {photo && <img className="comment-preview" src={photo} alt="Yüklenecek fotoğraf" />}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
      {comments.length === 0 ? (
        <p className="muted">İlk yorumu sen yaz, bir de fotoğrafını bırak.</p>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment">
              <span className="avatar" style={{ background: PLACE_KIND_COLORS[place.kind] }} aria-hidden="true">
                {initials(comment.name)}
              </span>
              <div>
                <p className="comment-head">
                  <strong>{comment.name}</strong>
                  <span>{formatDate(comment.createdAt)}</span>
                </p>
                <p className="comment-text">{comment.text}</p>
                {comment.scores && (
                  <p className="comment-scores">
                    Doğa {comment.scores.nature} · Temizlik {comment.scores.clean} · Ulaşım {comment.scores.access} ·
                    Güvenlik {comment.scores.safety}
                  </p>
                )}
                {comment.photo && <img className="comment-photo" src={comment.photo} alt="" />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
