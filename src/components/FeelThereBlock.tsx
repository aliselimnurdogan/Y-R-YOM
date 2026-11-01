import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { spotsForPlace, spotKindLabel, streetEmbed, type CampSpot } from '../camp-spots'
import { placeCover } from '../format'
import { sameMedia, sharpUrl } from '../media'
import { startPlaceAmbience, type AmbienceHandle } from '../place-ambience'
import { HAS_FEEL, HAS_SPOTS } from '../step'
import type { PlaceItem, PlacePano, PlaceVideo } from '../types'
import { EyeIcon } from './Icons'

interface ViewerHandle {
  destroy: () => void
  startOrientation?: () => void
  startAutoRotate?: (speed?: number) => void
  toggleFullscreen?: () => void
  resize?: () => void
}

declare global {
  interface Window {
    pannellum?: {
      viewer: (el: HTMLElement, cfg: Record<string, unknown>) => ViewerHandle
    }
  }
}

let pannellumWait: Promise<void> | null = null

function loadPannellum() {
  if (window.pannellum) return Promise.resolve()
  if (pannellumWait) return pannellumWait
  pannellumWait = new Promise((resolve, reject) => {
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = './vendor/pannellum.css'
    document.head.appendChild(css)
    const script = document.createElement('script')
    script.src = './vendor/pannellum.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('360 yüklenemedi'))
    document.body.appendChild(script)
  })
  return pannellumWait
}

function firstClip(videos: PlaceVideo[]): PlaceVideo | undefined {
  return videos.find((item) => item.src || item.youtubeId)
}

function clipSrc(video: PlaceVideo): string | undefined {
  if (video.src) return video.src
  if (video.youtubeId) {
    return `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&mute=1&loop=1&playsinline=1&controls=0&playlist=${video.youtubeId}`
  }
  return undefined
}

function viewerConfig(pano: PlacePano) {
  const panorama = pano.url
  const preview = pano.preview || pano.url
  return {
    type: 'equirectangular',
    panorama,
    preview,
    autoLoad: true,
    compass: true,
    showFullscreenCtrl: true,
    showZoomCtrl: true,
    keyboardZoom: true,
    mouseZoom: true,
    draggable: true,
    friction: 0.08,
    hfov: 70,
    minHfov: 40,
    maxHfov: 90,
    doubleClickZoom: true,
    crossOrigin: 'anonymous',
    backgroundColor: [8, 12, 10],
    autoRotate: 0.7,
    autoRotateInactivityDelay: 2400,
  }
}

export function FeelThereBlock({ place }: { place: PlaceItem }) {
  const [params] = useSearchParams()
  const pano = place.pano
  const clip = firstClip(place.videos)
  const spots = useMemo(() => (HAS_SPOTS ? spotsForPlace(place) : []), [place])
  const [open, setOpen] = useState(false)
  const [spotId, setSpotId] = useState(spots[0]?.id ?? '')

  useEffect(() => {
    if (!HAS_SPOTS) return
    const wanted = params.get('spot')
    if (!wanted) return
    if (spots.some((item) => item.id === wanted)) {
      setSpotId(wanted)
      setOpen(true)
    }
  }, [params, spots])

  if (!HAS_FEEL) return null
  const cover = placeCover(place)
  const cardPhoto = cover ? sharpUrl(cover, 1920) : spots.find((item) => item.photo)?.photo || ''
  const livePhotos = (place.images.length > 0 ? place.images : cover ? [cover] : []).map((item) =>
    sharpUrl(item, 1920),
  )
  const sameSphere =
    pano?.kind === '360' &&
    Boolean(cover) &&
    (sameMedia(pano.url, cover) || (pano.preview ? sameMedia(pano.preview, cover) : false))
  const canOpen = HAS_SPOTS ? spots.length > 0 : Boolean(cover || pano || clip)
  const badge = HAS_SPOTS
    ? spots.length > 1
      ? `${spots.length} nokta`
      : spotKindLabel(spots[0]?.kind ?? 'photo')
    : sameSphere
      ? '360°'
      : cover
        ? 'Bakış'
        : clip
          ? 'Video'
          : 'Bakış'
  const embed = clip ? clipSrc(clip) : undefined

  return (
    <section className="feel-block">
      <button
        type="button"
        className="feel-card"
        onClick={() => {
          setSpotId(params.get('spot') || spots[0]?.id || '')
          setOpen(true)
        }}
        disabled={!canOpen}
      >
        {cardPhoto ? (
          <img className="feel-pan" src={cardPhoto} alt="" referrerPolicy="no-referrer" />
        ) : embed && clip?.src ? (
          <video className="feel-pan" src={clip.src} muted loop autoPlay playsInline />
        ) : (
          <span className="feel-empty-bg" />
        )}
        <span className="feel-shade" />
        <span className="feel-copy">
          <span className="feel-badge">{canOpen ? badge : 'Yakında'}</span>
          <span className="feel-title">Orada gibi hisset</span>
          <span className="feel-sub">
            {HAS_SPOTS && spots.length > 1
              ? 'İçeri gir: göl kenarı, çadır, giriş. Özel 360 çekim yok; sokak bakışı veya yerinde fotoğraf.'
              : canOpen
                ? 'İçeri gir: aynı karede dur, bakışın hafif kayar. Alttan sessiz bir akustik gelir.'
                : 'Bu parkta henüz yerinde bakış yok; uydurma görüntü konmadı.'}
          </span>
          {canOpen && (
            <span className="feel-cta">
              <EyeIcon />
              İçeri gir
            </span>
          )}
        </span>
      </button>
      {open && canOpen && (
        <FeelViewer
          placeTitle={place.title}
          placeCity={`${place.city} · ${place.region}`}
          placeKind={place.kind}
          cover={cover}
          photos={livePhotos}
          pano={sameSphere ? pano : undefined}
          clip={cover ? undefined : clip}
          spots={HAS_SPOTS ? spots : []}
          spotId={spotId}
          onSpot={setSpotId}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  )
}

function FeelViewer({
  placeTitle,
  placeCity,
  placeKind,
  cover,
  photos,
  pano,
  clip,
  spots,
  spotId,
  onSpot,
  onClose,
}: {
  placeTitle: string
  placeCity: string
  placeKind: string
  cover: string
  photos: string[]
  pano?: PlacePano
  clip?: PlaceVideo
  spots: CampSpot[]
  spotId: string
  onSpot: (id: string) => void
  onClose: () => void
}) {
  const spot = spots.find((item) => item.id === spotId) ?? spots[0]
  const useSphere = (spot?.kind === 'pano' && spot.pano?.kind === '360') || (!spot && pano?.kind === '360')
  const sphere = spot?.pano ?? pano
  const hostRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<ViewerHandle | null>(null)
  const toneRef = useRef<AmbienceHandle | null>(null)
  const [muted, setMuted] = useState(false)
  const [status, setStatus] = useState(useSphere ? 'Görüntü hazırlanıyor…' : '')
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const onFs = () => viewerRef.current?.resize?.()
    document.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onFs)
    toneRef.current = startPlaceAmbience(placeKind)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('fullscreenchange', onFs)
      document.body.style.overflow = previousOverflow
      viewerRef.current?.destroy()
      viewerRef.current = null
      toneRef.current?.stop()
      toneRef.current = null
    }
  }, [onClose, placeKind])

  useEffect(() => {
    setFade(true)
    const wait = window.setTimeout(() => setFade(false), 180)
    return () => window.clearTimeout(wait)
  }, [spotId])

  useEffect(() => {
    viewerRef.current?.destroy()
    viewerRef.current = null
    if (!useSphere || !sphere) {
      setStatus('')
      return
    }
    let alive = true
    setStatus('Görüntü hazırlanıyor…')
    void loadPannellum()
      .then(() => {
        if (!alive || !hostRef.current || !window.pannellum) return
        const viewer = window.pannellum.viewer(hostRef.current, viewerConfig(sphere))
        viewerRef.current = viewer
        viewer.startAutoRotate?.(0.7)
        setStatus('')
      })
      .catch(() => {
        if (alive) setStatus('360 görüntü yüklenemedi. İnterneti kontrol et.')
      })
    return () => {
      alive = false
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [sphere, useSphere, spotId])

  async function goFullscreen() {
    const node = overlayRef.current
    if (!node) return
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await node.requestFullscreen()
      viewerRef.current?.resize?.()
    } catch {
      viewerRef.current?.toggleFullscreen?.()
    }
  }

  async function useGyro() {
    const orient = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    try {
      if (typeof orient.requestPermission === 'function') {
        const allowed = await orient.requestPermission()
        if (allowed !== 'granted') return
      }
      viewerRef.current?.startOrientation?.()
    } catch {
      viewerRef.current?.startOrientation?.()
    }
  }

  const stageKind = spot?.kind
  const pipClip = !spots.length && pano && clip ? clip : undefined

  return createPortal(
    <div
      className="feel-overlay"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${placeTitle} bakış`}
    >
      <div className={fade ? 'feel-stage is-fade' : 'feel-stage'}>
        {useSphere ? (
          <div ref={hostRef} className="feel-sphere" />
        ) : stageKind === 'street' && spot ? (
          <iframe
            key={spot.id}
            className="feel-frame"
            src={streetEmbed(spot.lat, spot.lng, spot.heading)}
            title={spot.title}
            allow="accelerometer; gyroscope; fullscreen"
            allowFullScreen
          />
        ) : stageKind === 'video' && spot?.video ? (
          <VideoStage clip={spot.video} />
        ) : (
          <LookPan
            cover={spot?.photo || cover}
            photos={spot?.photo ? [spot.photo] : photos}
            clip={stageKind === 'video' ? spot?.video : clip}
          />
        )}
      </div>
      {status && <p className="feel-status">{status}</p>}
      {pipClip && <ClipPip clip={pipClip} />}
      {spots.length > 1 && (
        <aside className="feel-pip is-spots" aria-label="Kamp içi noktalar">
          <p>Noktalar</p>
          {spots.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === spot?.id ? 'is-on' : undefined}
              onClick={() => onSpot(item.id)}
            >
              <strong>{item.title}</strong>
              <span>{spotKindLabel(item.kind)}</span>
            </button>
          ))}
        </aside>
      )}
      <div className="feel-bar">
        <p>
          <strong>
            {placeTitle}
            {spot ? ` · ${spot.title}` : ''}
          </strong>
          <span>
            {placeCity}
            {spots.length > 1 ? ' · nokta seç, sahne değişir' : ' · bakışın duruyor, gözün geziyor'}
          </span>
        </p>
        {spots.length > 1 && (
          <div className="feel-spots" role="tablist" aria-label="Alt noktalar">
            {spots.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === spot?.id}
                className={item.id === spot?.id ? 'is-on' : undefined}
                onClick={() => onSpot(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>
        )}
        <div className="feel-bar-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setMuted((value) => {
                const next = !value
                toneRef.current?.setMuted(next)
                return next
              })
            }}
          >
            {muted ? 'Sesi aç' : 'Sesi kıs'}
          </button>
          {useSphere && (
            <button type="button" className="btn-ghost" onClick={() => void useGyro()}>
              Telefonu çevir
            </button>
          )}
          <button type="button" className="btn-ghost" onClick={() => void goFullscreen()}>
            Tam ekran
          </button>
          <button type="button" className="btn-fill" onClick={onClose}>
            Çık
          </button>
        </div>
      </div>
      <p className="feel-credit">{spot?.credit || pano?.credit || clip?.title || ''}</p>
    </div>,
    document.body,
  )
}

function VideoStage({ clip }: { clip: PlaceVideo }) {
  if (clip.src) {
    return <video src={clip.src} muted loop autoPlay playsInline controls />
  }
  if (!clip.youtubeId) return <span className="feel-empty-bg" />
  return (
    <iframe
      className="feel-frame"
      src={`https://www.youtube-nocookie.com/embed/${clip.youtubeId}?autoplay=1&mute=1&rel=0`}
      title={clip.title}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
    />
  )
}

function ClipPip({ clip }: { clip: PlaceVideo }) {
  if (clip.src) {
    return <video className="feel-pip" src={clip.src} muted loop autoPlay playsInline controls />
  }
  if (!clip.youtubeId) return null
  return (
    <iframe
      className="feel-pip"
      src={`https://www.youtube-nocookie.com/embed/${clip.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${clip.youtubeId}`}
      title={clip.title}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
    />
  )
}

function LookPan({ cover, photos, clip }: { cover: string; photos: string[]; clip?: PlaceVideo }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const xRef = useRef(50)
  const yRef = useRef(46)
  const aimRef = useRef({ x: 50, y: 46, until: 0 })
  const dragRef = useRef<{ x: number; y: number; startX: number; startY: number; pausedUntil: number } | null>(null)
  const [shift, setShift] = useState({ x: 50, y: 46 })
  const photo = photos[0] || (cover ? sharpUrl(cover, 1920) : '')

  useEffect(() => {
    const onOrient = (event: DeviceOrientationEvent) => {
      if (dragRef.current) return
      const gamma = Math.max(-10, Math.min(10, event.gamma ?? 0))
      const beta = Math.max(28, Math.min(58, event.beta ?? 45))
      xRef.current = 50 + (gamma / 10) * 6
      yRef.current = 46 + ((beta - 45) / 30) * 5
      setShift({ x: xRef.current, y: yRef.current })
    }
    window.addEventListener('deviceorientation', onOrient)
    return () => window.removeEventListener('deviceorientation', onOrient)
  }, [])

  useEffect(() => {
    let frame = 0
    const tick = (now: number) => {
      const drag = dragRef.current
      const holding = Boolean(drag && drag.pausedUntil === Number.POSITIVE_INFINITY)
      const cooling = Boolean(drag && now < drag.pausedUntil)
      if (drag && !holding && !cooling) dragRef.current = null
      if (!holding && !cooling) {
        if (now > aimRef.current.until) {
          aimRef.current = {
            x: 50 + (Math.random() * 10 - 5),
            y: 46 + (Math.random() * 6 - 3),
            until: now + 2200 + Math.random() * 2800,
          }
        }
        xRef.current += (aimRef.current.x - xRef.current) * 0.012
        yRef.current += (aimRef.current.y - yRef.current) * 0.012
        xRef.current += Math.sin(now / 430) * 0.012
        yRef.current += Math.sin(now / 610) * 0.01
        setShift({ x: xRef.current, y: yRef.current })
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      startX: xRef.current,
      startY: yRef.current,
      pausedUntil: Number.POSITIVE_INFINITY,
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pausedUntil !== Number.POSITIVE_INFINITY) return
    const width = stageRef.current?.clientWidth || 1
    const height = stageRef.current?.clientHeight || 1
    xRef.current = Math.max(40, Math.min(60, drag.startX + ((drag.x - event.clientX) / width) * 28))
    yRef.current = Math.max(38, Math.min(54, drag.startY + ((drag.y - event.clientY) / height) * 18))
    setShift({ x: xRef.current, y: yRef.current })
  }

  function onPointerUp() {
    if (!dragRef.current) return
    dragRef.current = {
      x: 0,
      y: 0,
      startX: xRef.current,
      startY: yRef.current,
      pausedUntil: performance.now() + 1600,
    }
  }

  return (
    <div
      className="look-stage"
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {photo ? (
        <div
          className="look-drift is-gaze"
          style={{
            transform: `translate(${(shift.x - 50) * -0.22}%, ${(shift.y - 46) * -0.16}%) scale(1.12)`,
          }}
        >
          <img className="is-on" src={photo} alt="" draggable={false} referrerPolicy="no-referrer" />
        </div>
      ) : clip?.src ? (
        <video src={clip.src} muted loop autoPlay playsInline />
      ) : clip?.youtubeId ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${clip.youtubeId}?autoplay=1&mute=1&rel=0`}
          title={clip.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <span className="feel-empty-bg" />
      )}
    </div>
  )
}
