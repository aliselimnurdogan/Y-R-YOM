import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useSearch } from '../search-context'
import { HAS_CATALOG, HAS_HOME, HAS_LIVE, HAS_POLISH, HAS_ROUTE_MODE, ROUTES_PATH } from '../step'
import { BrandLockup } from './Brand'
import { PinMark, SearchIcon } from './Icons'

export function Header() {
  const { query, setQuery } = useSearch()
  const navigate = useNavigate()
  const location = useLocation()
  const [authOpen, setAuthOpen] = useState(false)

  function updateQuery(next: string) {
    setQuery(next)
    const onCamp = location.pathname.startsWith('/kamp')
    const onRoute = location.pathname.startsWith('/rota')
    if (HAS_ROUTE_MODE) {
      if (HAS_HOME && location.pathname === '/') navigate(ROUTES_PATH)
      else if (onRoute) navigate(ROUTES_PATH)
      else if (onCamp && location.pathname !== '/kamp') navigate('/kamp')
      return
    }
    if (location.pathname !== '/') navigate('/')
  }

  const onCamp = location.pathname.startsWith('/kamp')
  const onHome = HAS_HOME && location.pathname === '/'
  const onRoutes =
    location.pathname === ROUTES_PATH || location.pathname.startsWith('/rota')
  const searchPlaceholder = HAS_ROUTE_MODE
    ? onHome
      ? 'Parkur, kamp veya yer ara'
      : onCamp
      ? HAS_LIVE
        ? 'Park, il, yayla veya kanyon ara'
        : HAS_CATALOG
          ? 'Park, il veya bölge ara'
          : 'Kamp alanı veya il ara'
      : 'Parkur, şehir veya bölge ara'
    : 'Kamp, yayla veya doğal alan ara'

  const headerClass = [
    'header',
    HAS_ROUTE_MODE ? 'has-modes' : '',
    HAS_POLISH ? 'is-polish-bar' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={headerClass}>
      {!HAS_POLISH && (
        <Link to="/" className="brand" aria-label="Yürüyom ana sayfa">
          <PinMark />
          <span className="wordmark">
            <span className="wy">y</span>ürüyom
          </span>
        </Link>
      )}
      {HAS_ROUTE_MODE && (
        <nav className="mode-nav" aria-label="Bölüm">
          <NavLink to={ROUTES_PATH} className={() => (onRoutes ? 'is-on' : undefined)}>
            {HAS_POLISH ? 'Parkurlar' : 'Yürüyüş parkurları'}
          </NavLink>
          <NavLink
            to="/kamp"
            className={() => (location.pathname.startsWith('/kamp') ? 'is-on' : undefined)}
          >
            {HAS_POLISH ? 'Kamp' : 'Kamp alanları'}
          </NavLink>
        </nav>
      )}
      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <SearchIcon />
        <input
          type="search"
          value={query}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          autoComplete="off"
          enterKeyHint="search"
          onChange={(event) => updateQuery(event.target.value)}
        />
        {query && (
          <button type="button" className="search-clear" aria-label="Aramayı temizle" onClick={() => updateQuery('')}>
            ×
          </button>
        )}
      </form>
      {HAS_POLISH && (
        <Link to="/" className="brand brand-end" aria-label="Yürüyom ana sayfa">
          <BrandLockup compact />
        </Link>
      )}
      {HAS_CATALOG ? null : (
        <div className="header-actions">
          <button type="button" className="btn-text" onClick={() => setAuthOpen(true)}>
            Giriş
          </button>
          <button type="button" className="btn-fill" onClick={() => setAuthOpen(true)}>
            Kaydol
          </button>
        </div>
      )}
      {authOpen && !HAS_CATALOG && <AuthModal onClose={() => setAuthOpen(false)} />}
    </header>
  )
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = dialogRef.current
    dialog?.querySelector<HTMLElement>('button')?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialog) return
      const nodes = [...dialog.querySelectorAll<HTMLElement>('button, [href], input')]
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previous?.focus()
    }
  }, [onClose])

  return createPortal(
    <div
      className="modal-back"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" ref={dialogRef}>
        <h2 id="auth-title">Hesap</h2>
        <p>Hesap özelliği sonraki adımda.</p>
        <div className="modal-actions">
          <button type="button" className="btn-fill" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
