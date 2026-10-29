import { Component, type ReactNode } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { DetailPage } from './components/DetailPage'
import { ExplorePage } from './components/ExplorePage'
import { PlacesProvider } from './places-context'
import { SearchProvider } from './search-context'

interface BoundaryProps {
  children: ReactNode
}

interface BoundaryState {
  hasError: boolean
}

class AppErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fatal">
          <p>Sayfa yüklenemedi.</p>
          <button type="button" className="btn-fill" onClick={() => window.location.reload()}>
            Yenile
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function NotFound() {
  return (
    <div className="detail">
      <h1>Sayfa bulunamadı</h1>
      <p className="lede">Aradığın sayfa yok.</p>
      <Link className="btn-ghost stack-gap" to="/">
        Alanlara dön
      </Link>
    </div>
  )
}

export function App() {
  return (
    <PlacesProvider>
      <SearchProvider>
        <div className="app-shell">
          <a className="skip" href="#icerik">
            İçeriğe geç
          </a>
          <Header />
          <main id="icerik">
            <AppErrorBoundary>
              <Routes>
                <Route path="/" element={<ExplorePage />} />
                <Route path="/yer/:id" element={<DetailPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppErrorBoundary>
          </main>
        </div>
      </SearchProvider>
    </PlacesProvider>
  )
}
