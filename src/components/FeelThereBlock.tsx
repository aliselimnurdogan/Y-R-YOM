import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { placeCover } from '../format'
import { sameMedia, sharpUrl } from '../media'
import { HAS_FEEL } from '../step'
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
    autoRotate: 9,
    autoRotateInactivityDelay: 1200,
  }
}

export function FeelThereBlock({ place }: { place: PlaceItem }) {
  const pano = place.pano
  const clip = firstClip(place.videos)
  const [open, setOpen] = useState(false)
  if (!HAS_FEEL) return null
  const cover = placeCover(place)
  const cardPhoto = cover ? sharpUrl(cover, 1920) : ''
  const livePhotos = (place.images.length > 0 ? place.images : cover ? [cover] : []).map((item) =>
    sharpUrl(item, 1920),
  )
  const sameSphere =
    pano?.kind === '360' &&
    Boolean(cover) &&
    (sameMedia(pano.url, cover) || (pano.preview ? sameMedia(pano.preview, cover) : false))
  const canOpen = Boolean(cover || pano || clip)
  const badge = sameSphere ? '360°' : cover ? 'Bakış' : clip ? 'Video' : 'Bakış'
  const embed = clip ? clipSrc(clip) : undefined

  return (
    <section className="feel-block">
      <button type="button" className="feel-card" onClick={() => setOpen(true)} disabled={!canOpen}>
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
            {canOpen
              ? 'İçeri gir: gördüğün bu kareye dal. Sürükle, telefonu çevir; yerinde duruyormuş gibi bak.'
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
          cover={cover}
          photos={livePhotos}
          pano={sameSphere ? pano : undefined}
          clip={cover ? undefined : clip}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  )
}

function FeelViewer({
  placeTitle,
  placeCity,
  cover,
  photos,
  pano,
  clip,
  onClose,
}: {
  placeTitle: string
  placeCity: string
  cover: string
  photos: string[]
  pano?: PlacePano
  clip?: PlaceVideo
  onClose: () => void
}) {
  const useSphere = pano?.kind === '360'
  const hostRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<ViewerHandle | null>(null)
  const [status, setStatus] = useState(useSphere ? 'Görüntü hazırlanıyor…' : '')

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const onFs = () => viewerRef.current?.resize?.()
    document.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onFs)
    let alive = true
    if (useSphere && pano) {
      void loadPannellum()
        .then(() => {
          if (!alive || !hostRef.current || !window.pannellum) return
          const viewer = window.pannellum.viewer(hostRef.current, viewerConfig(pano))
          viewerRef.current = viewer
          viewer.startAutoRotate?.(9)
          setStatus('')
        })
        .catch(() => {
          if (alive) setStatus('360 görüntü yüklenemedi. İnterneti kontrol et.')
        })
    }
    return () => {
      alive = false
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('fullscreenchange', onFs)
      document.body.style.overflow = previousOverflow
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [onClose, pano, useSphere])

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

  return createPortal(
    <div
      className="feel-overlay"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${placeTitle} bakış`}
    >
      {useSphere ? (
        <div ref={hostRef} className="feel-stage" />
      ) : (
        <LookPan cover={cover} photos={photos} clip={clip} />
      )}
      {status && <p className="feel-status">{status}</p>}
      {pano && clip && <ClipPip clip={clip} />}
      <div className="feel-bar">
        <p>
          <strong>{placeTitle}</strong>
          <span>{placeCity} · aynı karedesin · sürükle, bak, telefonu çevir</span>
        </p>
        <div className="feel-bar-actions">
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
      <p className="feel-credit">{pano?.credit || clip?.title || ''}</p>
    </div>,
    document.body,
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
  const yRef = useRef(42)
  const dirRef = useRef(1)
  const dragRef = useRef<{ x: number; y: number; startX: number; startY: number; pausedUntil: number } | null>(null)
  const [shift, setShift] = useState({ x: 50, y: 42 })
  const [shot, setShot] = useState(0)
  const frames = photos.length > 0 ? photos : cover ? [sharpUrl(cover, 1920)] : []
  const photo = frames[shot] || (cover ? sharpUrl(cover, 1920) : '')

  useEffect(() => {
    if (frames.length < 2) return
    const timer = window.setInterval(() => {
      setShot((current) => (current + 1) % frames.length)
    }, 9000)
    return () => window.clearInterval(timer)
  }, [frames.length])

  useEffect(() => {
    const onOrient = (event: DeviceOrientationEvent) => {
      if (dragRef.current) return
      const gamma = Math.max(-28, Math.min(28, event.gamma ?? 0))
      const beta = Math.max(10, Math.min(70, event.beta ?? 45))
      xRef.current = 50 + (gamma / 28) * 42
      yRef.current = 50 + ((beta - 45) / 30) * 22
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
        xRef.current += dirRef.current * 0.12
        yRef.current += Math.sin(now / 1800) * 0.04
        if (xRef.current > 92) {
          xRef.current = 92
          dirRef.current = -1
        } else if (xRef.current < 8) {
          xRef.current = 8
          dirRef.current = 1
        }
        yRef.current = Math.max(18, Math.min(78, yRef.current))
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
    xRef.current = Math.max(0, Math.min(100, drag.startX + ((drag.x - event.clientX) / width) * 130))
    yRef.current = Math.max(0, Math.min(100, drag.startY + ((drag.y - event.clientY) / height) * 90))
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
          className="look-drift"
          style={{
            transform: `translate(${shift.x * -0.55}%, ${shift.y * -0.28}%) scale(1.06)`,
          }}
        >
          {frames.length > 1 && (
            <img
              src={frames[(shot + frames.length - 1) % frames.length]}
              alt=""
              draggable={false}
              referrerPolicy="no-referrer"
            />
          )}
          <img key={photo} className="is-on" src={photo} alt="" draggable={false} referrerPolicy="no-referrer" />
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
