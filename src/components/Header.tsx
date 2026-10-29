import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSearch } from '../search-context'
import { PinMark, SearchIcon } from './Icons'

export function Header() {
  const { query, setQuery } = useSearch()
  const navigate = useNavigate()
  const location = useLocation()
  const [authOpen, setAuthOpen] = useState(false)

  function updateQuery(next: string) {
    setQuery(next)
    if (location.pathname !== '/') navigate('/')
  }

  return (
    <header className="header">
      <Link to="/" className="brand" aria-label="Yürüyom ana sayfa">
        <PinMark />
        <span className="wordmark">
          <span className="wy">y</span>ürüyom
        </span>
      </Link>
      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <SearchIcon />
        <input
          type="search"
          value={query}
          placeholder="Rota, şehir veya bölge ara"
          aria-label="Rota, şehir veya bölge ara"
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
      <div className="header-actions">
        <button type="button" className="btn-text" onClick={() => setAuthOpen(true)}>
          Giriş
        </button>
        <button type="button" className="btn-fill" onClick={() => setAuthOpen(true)}>
          Kaydol
        </button>
      </div>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
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
