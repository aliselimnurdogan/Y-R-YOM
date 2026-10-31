import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CONDITIONS, LAYERS, TABLES } from '../guide-copy'
import { LISTING_NOTE, loadListings, saveListing, type Listing, type ListingKind } from '../listings'
import { PROVINCES } from '../provinces'
import { TOUR_PATH } from '../step'

const iller = [...PROVINCES].sort((a, b) => a.name.localeCompare(b.name, 'tr'))

export function GuidePage() {
  const [tick, setTick] = useState(0)
  const listings = useMemo(() => loadListings(), [tick])
  const tours = listings.filter((item) => item.kind === 'tur')
  const meals = listings.filter((item) => item.kind === 'yemek')

  useEffect(() => {
    document.title = 'Rehber · Yürüyom'
  }, [])

  return (
    <div className="guide">
      <section className="guide-hero" aria-label="Rehber">
        <div>
          <p className="home-kicker">Yürüyom rehber</p>
          <h1>Nasıl gidilir, ne giyilir, nerede yenir</h1>
          <p className="lede">
            Tur, yemek ve kıyafet. Metin yanında çizim. Başkasının sitesi değil; bu sayfa Yürüyom’un kendi
            sesi. Pin izin değildir.
          </p>
        </div>
        <HeroArt />
      </section>

      <nav className="guide-jump" aria-label="Rehber bölümleri">
        <a href="#kiyafet">Kıyafet</a>
        <a href="#yemek">Yemek</a>
        <a href="#turlar">Turlar</a>
        <a href="#ilan">İlan ver</a>
      </nav>

      <section id="kiyafet" className="guide-block" aria-label="Outdoor kıyafet">
        <h2>Kat kat giyin</h2>
        <p className="guide-lead">
          Outdoor kıyafet süs değil. Islak pamuk üşütür. Kat çıkarılıp takılır; tek kalın mont terletir, sonra
          soğutur.
        </p>
        <div className="layer-stage">
          <LayerArt />
          <ol className="layer-list">
            {LAYERS.map((layer, index) => (
              <li key={layer.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{layer.title}</strong>
                  <em>{layer.wear}</em>
                  <p>{layer.when}</p>
                  <p>{layer.fabric}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <ul className="cond-grid">
          {CONDITIONS.map((item) => (
            <li key={item.id}>
              <CondArt id={item.id} />
              <strong>{item.title}</strong>
              <p>{item.line}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="yemek" className="guide-block" aria-label="Nerede yemek">
        <h2>Nerede ne yenir</h2>
        <p className="guide-lead">
          Yöresel tabak, restoran notu değil. Asıl ocağın adı aşağıda ilan olursa çıkar. Ağır öğünden sonra uzun
          yokuş yok.
        </p>
        <ul className="plate-grid">
          {TABLES.map((item) => (
            <li key={item.zone}>
              <PlateArt zone={item.zone} />
              <p className="home-kicker">{item.zone}</p>
              <strong>{item.plate}</strong>
              <p>{item.hint}</p>
            </li>
          ))}
        </ul>
        {meals.length > 0 && (
          <div className="guide-ads">
            <h3>Yemek ilanları</h3>
            <ListingCards items={meals} />
          </div>
        )}
      </section>

      <section id="turlar" className="guide-block" aria-label="Turlar">
        <h2>Turlar</h2>
        <p className="guide-lead">
          Rehber ücretini alır, tur sitede durur. Kart henüz çekilmez. Geziyorum’da ile tıklayınca o ilin turu da
          görünür.
        </p>
        {tours.length === 0 ? (
          <p className="tour-empty">Henüz tur ilanı yok. Aşağıdan bırak.</p>
        ) : (
          <ListingCards items={tours} />
        )}
      </section>

      <section id="ilan" className="guide-block" aria-label="İlan ver">
        <h2>İlan ver</h2>
        <p className="guide-lead">{LISTING_NOTE}</p>
        <ListingForm
          onSave={() => {
            setTick((value) => value + 1)
          }}
        />
      </section>
    </div>
  )
}

function ListingCards({ items }: { items: Listing[] }) {
  return (
    <ul className="ilan-grid">
      {items.map((item) => (
        <li key={item.id} className={item.kind === 'yemek' ? 'is-food' : 'is-tur'}>
          <p className="home-kicker">
            {item.kind === 'tur' ? 'Tur' : 'Yemek ilanı'}
            {item.sample ? ' · örnek' : ''}
          </p>
          <strong>{item.title}</strong>
          <p>
            {item.province} · {item.host}
          </p>
          <p className="ilan-price">{item.price}</p>
          <p>{item.blurb}</p>
          <Link to={TOUR_PATH}>{item.province} haritası</Link>
        </li>
      ))}
    </ul>
  )
}

function ListingForm({ onSave }: { onSave: () => void }) {
  const [kind, setKind] = useState<ListingKind>('tur')
  const [province, setProvince] = useState('Adana')
  const [title, setTitle] = useState('')
  const [host, setHost] = useState('')
  const [price, setPrice] = useState('')
  const [blurb, setBlurb] = useState('')
  const [done, setDone] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim() || !host.trim() || !blurb.trim()) return
    saveListing({
      kind,
      province,
      title,
      host,
      price: price.trim() || 'Fiyat yazılmadı',
      blurb,
    })
    setTitle('')
    setHost('')
    setPrice('')
    setBlurb('')
    setDone('İlan bu tarayıcıda duruyor. Kart çekilmedi.')
    onSave()
  }

  return (
    <form className="ilan-form" onSubmit={submit}>
      <label>
        Tür
        <select value={kind} onChange={(event) => setKind(event.target.value as ListingKind)}>
          <option value="tur">Tur düzenliyorum</option>
          <option value="yemek">Yemek ilanı</option>
        </select>
      </label>
      <label>
        İl
        <select value={province} onChange={(event) => setProvince(event.target.value)}>
          {iller.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Başlık
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Adın / işletme
        <input value={host} onChange={(event) => setHost(event.target.value)} required />
      </label>
      <label>
        Ücret
        <input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Kişi 650 TL" />
      </label>
      <label className="is-wide">
        Kısa yazı
        <textarea value={blurb} onChange={(event) => setBlurb(event.target.value)} rows={3} required />
      </label>
      <button type="submit" className="btn-fill">
        İlanı bırak
      </button>
      {done ? <p className="land-note">{done}</p> : null}
    </form>
  )
}

function HeroArt() {
  return (
    <svg className="guide-hero-art" viewBox="0 0 280 180" aria-hidden="true">
      <rect width="280" height="180" rx="22" fill="#24382e" />
      <path d="M0 118 48 86l36 22 52-48 44 28 100-62V180H0Z" fill="#3b5c4c" />
      <path d="M0 142 40 118l34 16 48-36 40 22 118-54V180H0Z" fill="#1b2c24" />
      <path d="M42 150c18-28 38-40 58-62 22-24 48-38 78-52" fill="none" stroke="#e2c57a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="188" cy="32" r="10" fill="#f6ead0" />
      <path d="M54 128c8 6 14 18 14 18" fill="none" stroke="#c43121" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function LayerArt() {
  return (
    <svg className="layer-art" viewBox="0 0 160 220" aria-hidden="true">
      <rect width="160" height="220" rx="18" fill="#f4efe4" />
      <ellipse cx="80" cy="36" rx="18" ry="20" fill="#c9b48a" />
      <rect x="48" y="54" width="64" height="28" rx="10" fill="#e8d7a8" />
      <rect x="42" y="80" width="76" height="36" rx="12" fill="#7a9a6a" />
      <rect x="36" y="112" width="88" height="40" rx="14" fill="#3b5c4c" />
      <rect x="30" y="148" width="100" height="36" rx="14" fill="#24382e" />
      <rect x="52" y="182" width="22" height="26" rx="6" fill="#6b5344" />
      <rect x="86" y="182" width="22" height="26" rx="6" fill="#6b5344" />
      <text x="80" y="74" textAnchor="middle" fill="#24382e" fontSize="9" fontWeight="700">
        iç
      </text>
      <text x="80" y="102" textAnchor="middle" fill="#f6ead0" fontSize="9" fontWeight="700">
        ara
      </text>
      <text x="80" y="136" textAnchor="middle" fill="#e2c57a" fontSize="9" fontWeight="700">
        kabuk
      </text>
      <text x="80" y="170" textAnchor="middle" fill="#f6ead0" fontSize="9" fontWeight="700">
        dış
      </text>
    </svg>
  )
}

function CondArt({ id }: { id: string }) {
  if (id === 'sahil') {
    return (
      <svg viewBox="0 0 120 64" aria-hidden="true">
        <rect width="120" height="64" rx="12" fill="#d7eee8" />
        <path d="M0 40h120v24H0Z" fill="#7eb8c4" />
        <circle cx="96" cy="16" r="8" fill="#e2c57a" />
      </svg>
    )
  }
  if (id === 'orman') {
    return (
      <svg viewBox="0 0 120 64" aria-hidden="true">
        <rect width="120" height="64" rx="12" fill="#dce8d0" />
        <path d="M22 52 38 18 54 52Z" fill="#3b5c4c" />
        <path d="M50 52 68 12 86 52Z" fill="#24382e" />
      </svg>
    )
  }
  if (id === 'kis') {
    return (
      <svg viewBox="0 0 120 64" aria-hidden="true">
        <rect width="120" height="64" rx="12" fill="#e4eaf0" />
        <path d="M0 48 28 28 52 40 88 16 120 36v28H0Z" fill="#f7fbff" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 120 64" aria-hidden="true">
      <rect width="120" height="64" rx="12" fill="#e7ecd8" />
      <path d="M0 44 36 22 64 34 120 10v54H0Z" fill="#8aa56a" />
      <circle cx="22" cy="16" r="7" fill="#e2c57a" />
    </svg>
  )
}

function PlateArt({ zone }: { zone: string }) {
  const fill = zone.includes('Karadeniz')
    ? '#3b5c4c'
    : zone.includes('Ege')
      ? '#6a8f4e'
      : zone.includes('Marmara')
        ? '#4a6d7a'
        : zone.includes('Güneydoğu')
          ? '#c43121'
          : zone.includes('Doğu')
            ? '#8a5a3a'
            : zone.includes('İç')
              ? '#c4a05a'
              : '#c43121'
  return (
    <svg viewBox="0 0 140 72" aria-hidden="true">
      <rect width="140" height="72" rx="14" fill="#f4efe4" />
      <ellipse cx="70" cy="38" rx="44" ry="22" fill="#efe4d0" />
      <ellipse cx="70" cy="38" rx="28" ry="14" fill={fill} />
    </svg>
  )
}
