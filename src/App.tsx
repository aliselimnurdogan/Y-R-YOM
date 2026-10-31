import { Component, useEffect, type ReactNode } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { DetailPage } from './components/DetailPage'
import { ExplorePage } from './components/ExplorePage'
import { HomePage } from './components/HomePage'
import { RouteDetailPage } from './components/RouteDetailPage'
import { RouteExplorePage } from './components/RouteExplorePage'
import { PlacesProvider } from './places-context'
import { RoutesProvider } from './routes-context'
import { SearchProvider } from './search-context'
import { HAS_ATLAS, HAS_HOME, HAS_LAND, HAS_LIVE, HAS_LOOK, HAS_POLISH, HAS_ROUTE_MODE, HAS_TOUR, ROUTES_PATH } from './step'

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
  const home = HAS_HOME ? '/' : ROUTES_PATH
  const label = HAS_ROUTE_MODE ? (HAS_HOME ? 'Ana sayfaya dön' : 'Parkurlara dön') : 'Alanlara dön'
  return (
    <div className="detail">
      <h1>Sayfa bulunamadı</h1>
      <p className="lede">Aradığın sayfa yok.</p>
      <Link className="btn-ghost stack-gap" to={home}>
        {label}
      </Link>
    </div>
  )
}

function Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.toggle('is-look', HAS_LOOK)
    document.body.classList.toggle('is-live', HAS_LIVE)
    document.body.classList.toggle('is-polish', HAS_POLISH)
    document.body.classList.toggle('is-atlas', HAS_ATLAS)
    document.body.classList.toggle('is-tour', HAS_TOUR)
    document.body.classList.toggle('is-land', HAS_LAND)
    if (HAS_POLISH) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute(
          'content',
          'Yürüyom: Türkiye kamp, yayla ve yürüyüş parkurları. Wikimedia fotoğraf, OSM harita, telifsiz arayüz.',
        )
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#24382e')
    } else if (HAS_LIVE) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute(
          'content',
          'Yürüyom ile Türkiye’nin 81 ilindeki kamp, yayla, kanyon ve doğal alanları Ultra-HD 360° ve gerçek doğa videolarıyla keşfet',
        )
    }
    return () => {
      document.body.classList.remove('is-look', 'is-atlas', 'is-tour', 'is-land')
      document.body.classList.remove('is-live')
      document.body.classList.remove('is-polish')
    }
  }, [])

  return (
    <SearchProvider>
      <div className={HAS_LOOK ? 'app-shell is-look' : 'app-shell'}>
        <a className="skip" href="#icerik">
          İçeriğe geç
        </a>
        <Header />
        <main id="icerik">
          <AppErrorBoundary>{children}</AppErrorBoundary>
        </main>
      </div>
    </SearchProvider>
  )
}

export function App() {
  if (HAS_ROUTE_MODE) {
    return (
      <RoutesProvider>
        <PlacesProvider>
          <Shell>
            <Routes>
              <Route path="/" element={HAS_HOME ? <HomePage /> : <RouteExplorePage />} />
              {HAS_HOME && <Route path="/parkurlar" element={<RouteExplorePage />} />}
              <Route path="/rota/:id" element={<RouteDetailPage />} />
              <Route path="/kamp" element={<ExplorePage />} />
              <Route path="/kamp/:id" element={<DetailPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Shell>
        </PlacesProvider>
      </RoutesProvider>
    )
  }

  return (
    <PlacesProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/yer/:id" element={<DetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Shell>
    </PlacesProvider>
  )
}
