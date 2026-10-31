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
  const sponsors = listings.filter((item) => item.kind === 'ana')

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
          <MannequinArt />
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
              <TableArt zone={item.zone} />
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
          Rehber ücretini alır, tur burada durur. Kart henüz çekilmez. Geziyorum ayrı; orada harita ve il sponsorları
          vardır.
        </p>
        {tours.length === 0 ? (
          <p className="tour-empty">Henüz tur ilanı yok. Aşağıdan bırak.</p>
        ) : (
          <ListingCards items={tours} />
        )}
        {sponsors.length > 0 && (
          <div className="guide-ads">
            <h3>Sponsorlar</h3>
            <ListingCards items={sponsors} />
          </div>
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
        <li key={item.id} className={item.kind === 'yemek' ? 'is-food' : item.kind === 'ana' ? 'is-ana' : 'is-tur'}>
          <p className="home-kicker">
            {item.kind === 'tur' ? 'Tur' : item.kind === 'ana' ? 'Ana sponsor' : 'Yemek önerisi'}
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
          <option value="yemek">Yemek önerisi</option>
          <option value="ana">Ana sponsor</option>
        </select>
      </label>
      <label>
        İl
        <select value={province} onChange={(event) => setProvince(event.target.value)}>
          <option value="Türkiye">Türkiye (harita)</option>
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

function MannequinArt() {
  return (
    <svg className="layer-art is-mannequin" viewBox="0 0 240 400" aria-hidden="true">
      <rect width="240" height="400" rx="22" fill="#efe8d8" />
      <ellipse cx="120" cy="378" rx="52" ry="10" fill="#d8cbb0" />
      <rect x="116" y="74" width="8" height="18" rx="3" fill="#c9b48a" />
      <ellipse cx="120" cy="48" rx="22" ry="26" fill="#d7c09a" />
      <ellipse cx="120" cy="50" rx="16" ry="20" fill="#c9b48a" />
      <path d="M64 108c12-22 28-34 56-34s44 12 56 34l12 22-10 86c-14 20-34 28-58 28s-44-8-58-28l-10-86Z" fill="#3b5c4c" />
      <path d="M58 126c-10 26-8 52 2 70 6-22 12-44 16-64Z" fill="#2f4a3e" />
      <path d="M182 126c10 26 8 52-2 70-6-22-12-44-16-64Z" fill="#2f4a3e" />
      <path d="M102 96c8-8 12-10 18-10s10 2 18 10v14H102Z" fill="#f6ead0" />
      <path d="M96 112c10-4 16-6 24-6s14 2 24 6v78c-8 8-16 10-24 10s-16-2-24-10Z" fill="#f3e6c4" />
      <path d="M102 120c8-4 12-6 18-6s10 2 18 6v40c-6 6-12 8-18 8s-12-2-18-8Z" fill="#7a9a6a" />
      <path d="M86 102c12-14 22-18 34-18s22 4 34 18l8 12-10 8H88Z" fill="#24382e" />
      <path d="M96 210h48v88H96Z" fill="#4a3c32" />
      <path d="M96 210c8 8 16 10 24 10s16-2 24-10v12H96Z" fill="#f6ead0" />
      <path d="M94 294h24v32c-2 10-8 14-14 14-8 0-12-8-10-18Z" fill="#6b5344" />
      <path d="M122 294h24v32c2 10-2 18-10 18-6 0-12-4-14-14Z" fill="#6b5344" />
      <line x1="48" y1="148" x2="78" y2="132" stroke="#24382e" strokeWidth="1.4" />
      <line x1="190" y1="92" x2="168" y2="104" stroke="#24382e" strokeWidth="1.4" />
      <line x1="196" y1="310" x2="150" y2="310" stroke="#24382e" strokeWidth="1.4" />
      <text x="18" y="154" fill="#24382e" fontSize="12" fontWeight="800">
        iç
      </text>
      <text x="18" y="122" fill="#3b5c4c" fontSize="12" fontWeight="800">
        polar
      </text>
      <text x="186" y="86" fill="#24382e" fontSize="12" fontWeight="800">
        kabuk
      </text>
      <text x="186" y="314" fill="#24382e" fontSize="12" fontWeight="800">
        bot
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

function TableArt({ zone }: { zone: string }) {
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
    <svg viewBox="0 0 180 110" aria-hidden="true">
      <rect width="180" height="110" rx="16" fill="#f4efe4" />
      <ellipse cx="48" cy="30" rx="13" ry="15" fill="#c9b48a" />
      <path d="M34 44c8-6 20-6 28 0v28H34Z" fill="#7a9a6a" />
      <path d="M28 72h36v16H28Z" fill="#4a3c32" />
      <path d="M16 86h148v12H16Z" fill="#8a6a48" />
      <ellipse cx="118" cy="82" rx="34" ry="12" fill="#efe4d0" />
      <ellipse cx="118" cy="80" rx="18" ry="7" fill={fill} />
      <rect x="102" y="62" width="5" height="18" rx="1" fill="#d8cbb0" />
      <path d="M132 58c6-10 14-10 18 0" fill="none" stroke="#c43121" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
