import { listingsFor, mainSponsor, type Listing } from '../listings'

export function MapSponsor() {
  const item = mainSponsor()
  if (!item) return null
  return (
    <div className="map-ana" aria-label="Ana sponsor">
      <p>Ana sponsor</p>
      <strong>{item.title}</strong>
      <span>
        {item.host}
        {item.sample ? ' · örnek' : ''}
      </span>
    </div>
  )
}

export function SponsorRail({ province }: { province: string }) {
  const meals = province ? listingsFor(province, 'yemek') : []
  const extras = province ? listingsFor(province, 'ana') : []

  return (
    <aside className="land-rail" aria-label="Sponsor">
      <p className="iller-title">Sponsor</p>
      {!province ? (
        <p className="tour-empty">İl seç. Sponsor varsa burada durur. Rehber ayrı sekmede.</p>
      ) : extras.length === 0 && meals.length === 0 ? (
        <p className="tour-empty">Bu ilde sponsor yok.</p>
      ) : (
        <>
          {extras.map((item) => (
            <SponsorCard key={item.id} item={item} kicker="Sponsor" />
          ))}
          {meals.length > 0 && <p className="rail-kicker">Yemek önerisi</p>}
          {meals.map((item) => (
            <SponsorCard key={item.id} item={item} kicker="Yemek önerisi" />
          ))}
        </>
      )}
    </aside>
  )
}

function SponsorCard({ item, kicker }: { item: Listing; kicker: string }) {
  return (
    <article className="rail-card">
      <p className="home-kicker">
        {kicker}
        {item.sample ? ' · örnek' : ''}
      </p>
      <strong>{item.title}</strong>
      <span>
        {item.host} · {item.price}
      </span>
      <p>{item.blurb}</p>
    </article>
  )
}
