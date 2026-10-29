import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { sharpUrl } from '../media'
import { HAS_FEEL } from '../step'
import type { PlaceItem, PlacePano } from '../types'
import { EyeIcon } from './Icons'

interface ViewerHandle {
  destroy: () => void
  startOrientation?: () => void
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

function viewerConfig(pano: PlacePano) {
  const ratio = pano.width && pano.height ? pano.width / pano.height : 1.6
  const panorama = sharpUrl(pano.url, 2048)
  const preview = sharpUrl(pano.preview || pano.url, 1280)
  const base = {
    type: 'equirectangular',
    panorama,
    preview,
    autoLoad: true,
    compass: false,
    showFullscreenCtrl: true,
    showZoomCtrl: true,
    keyboardZoom: true,
    mouseZoom: true,
    draggable: true,
    friction: 0.08,
    hfov: 78,
    minHfov: 38,
    maxHfov: 118,
    doubleClickZoom: true,
    crossOrigin: 'anonymous',
    backgroundColor: [8, 12, 10],
    autoRotate: pano.kind === '360' ? 3 : 1.6,
    autoRotateInactivityDelay: 14000,
  }
  if (pano.kind === '360') return base
  if (pano.kind === 'pano') {
    const haov = Math.min(300, Math.max(150, ratio * 70))
    const vaov = Math.min(120, Math.max(70, haov / Math.max(ratio, 1.2)))
    return {
      ...base,
      haov,
      vaov,
      minYaw: -(haov / 2) + 12,
      maxYaw: haov / 2 - 12,
      minPitch: -(vaov / 2) + 8,
      maxPitch: vaov / 2 - 8,
    }
  }
  return {
    ...base,
    haov: 100,
    vaov: 72,
    minYaw: -32,
    maxYaw: 32,
    minPitch: -20,
    maxPitch: 20,
    maxHfov: 100,
  }
}

export function FeelThereBlock({ place }: { place: PlaceItem }) {
  const pano = place.pano
  const [open, setOpen] = useState(false)
  if (!HAS_FEEL) return null
  const preview = place.images[0] || pano?.preview || pano?.url
  const cardPhoto = preview ? sharpUrl(preview, 1600) : ''
  const badge = pano?.kind === '360' ? '360°' : pano?.kind === 'pano' ? 'Panorama' : 'Bakış'

  return (
    <section className="feel-block">
      <button type="button" className="feel-card" onClick={() => setOpen(true)} disabled={!pano}>
        {cardPhoto ? (
          <img src={cardPhoto} alt="" />
        ) : (
          <span className="feel-empty-bg" />
        )}
        <span className="feel-shade" />
        <span className="feel-copy">
          <span className="feel-badge">{pano ? badge : 'Yakında'}</span>
          <span className="feel-title">Orada gibi hisset</span>
          <span className="feel-sub">
            {pano
              ? 'Kendi gözünden bak. Sürükle, parmağınla gez, telefonda çevir.'
              : 'Bu parkta henüz yerinde 360 çekim yok; uydurma görüntü konmadı.'}
          </span>
          {pano && (
            <span className="feel-cta">
              <EyeIcon />
              İçeri gir
            </span>
          )}
        </span>
      </button>
      {open && pano && <FeelViewer placeTitle={place.title} pano={pano} onClose={() => setOpen(false)} />}
    </section>
  )
}

function FeelViewer({
  placeTitle,
  pano,
  onClose,
}: {
  placeTitle: string
  pano: PlacePano
  onClose: () => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<ViewerHandle | null>(null)
  const [status, setStatus] = useState('Görüntü hazırlanıyor…')

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
    void loadPannellum()
      .then(() => {
        if (!alive || !hostRef.current || !window.pannellum) return
        viewerRef.current = window.pannellum.viewer(hostRef.current, {
          ...viewerConfig(pano),
        })
        setStatus('')
      })
      .catch(() => {
        if (alive) setStatus('360 görüntü yüklenemedi. İnterneti kontrol et.')
      })
    return () => {
      alive = false
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('fullscreenchange', onFs)
      document.body.style.overflow = previousOverflow
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [onClose, pano])

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
      <div ref={hostRef} className="feel-stage" />
      {status && <p className="feel-status">{status}</p>}
      <div className="feel-bar">
        <p>
          <strong>{placeTitle}</strong>
          <span>Sürükle · yakınlaş · telefonu çevir</span>
        </p>
        <div className="feel-bar-actions">
          <button type="button" className="btn-ghost" onClick={() => void useGyro()}>
            Telefonu çevir
          </button>
          <button type="button" className="btn-ghost" onClick={() => void goFullscreen()}>
            Tam ekran
          </button>
          <button type="button" className="btn-fill" onClick={onClose}>
            Çık
          </button>
        </div>
      </div>
      <p className="feel-credit">{pano.credit}</p>
    </div>,
    document.body,
  )
}
