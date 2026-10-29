import { useEffect, useId, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { compressPhoto, loadComments, saveComment } from '../community'
import { formatDate, formatInt, initials } from '../format'
import { PLACE_KIND_COLORS, PLACE_KIND_LABELS } from '../labels'
import { usePlaces } from '../places-context'
import { useSearch } from '../search-context'
import type { PlaceComment, PlaceItem } from '../types'
import { DetailMap } from './DetailMap'

export function DetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { status, places, reload } = usePlaces()
  const { setQuery } = useSearch()
  const place = places.find((item) => item.id === id) ?? null
  const [photoIndex, setPhotoIndex] = useState(0)

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
        <Link className="btn-ghost stack-gap" to="/">
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
          to="/"
          onClick={() => {
            setQuery('')
          }}
        >
          Kahramanmaraş
        </Link>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => {
            setQuery(place.city)
            navigate('/')
          }}
        >
          {place.city}
        </button>
      </nav>
      <h1>{place.title}</h1>
      <div className="author-row">
        <span className="chip" style={{ background: `${PLACE_KIND_COLORS[place.kind]}22`, color: PLACE_KIND_COLORS[place.kind] }}>
          {PLACE_KIND_LABELS[place.kind]}
        </span>
        <span className="act-name">{place.city}</span>
        <span className="chip">{formatInt(place.elevationM)} m</span>
        <div className="actions">
          <Link className="btn-ghost" to="/">
            Geri
          </Link>
        </div>
      </div>
      <p className="lede place-lede">{place.summary}</p>
      {currentImage && (
        <div className="gallery">
          <img className="gallery-main" src={currentImage} alt={place.title} />
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
                <img src={image} alt="" width={96} height={68} />
              </button>
            ))}
          </div>
        </div>
      )}
      {place.videos.length > 0 && (
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
      <Comments place={place} />
    </article>
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
                {comment.photo && <img className="comment-photo" src={comment.photo} alt="" />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
