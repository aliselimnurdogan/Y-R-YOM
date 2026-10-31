import { Link } from 'react-router-dom'
import { listingsFor } from '../listings'
import { GUIDE_PATH } from '../step'

export function ProvinceMarket({ province }: { province: string }) {
  const tours = listingsFor(province, 'tur')
  const meals = listingsFor(province, 'yemek')
  if (tours.length === 0 && meals.length === 0) return null

  return (
    <aside className="land-market" aria-label={`${province} ilanları`}>
      {meals.length > 0 && (
        <div>
          <h3>Burada yesin</h3>
          <ul>
            {meals.map((item) => (
              <li key={item.id}>
                <p className="home-kicker">
                  Yemek ilanı
                  {item.sample ? ' · örnek' : ''}
                </p>
                <strong>{item.title}</strong>
                <span>
                  {item.host} · {item.price}
                </span>
                <p>{item.blurb}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {tours.length > 0 && (
        <div>
          <h3>Bu ilde tur</h3>
          <ul>
            {tours.map((item) => (
              <li key={item.id}>
                <p className="home-kicker">
                  Tur
                  {item.sample ? ' · örnek' : ''}
                </p>
                <strong>{item.title}</strong>
                <span>
                  {item.host} · {item.price}
                </span>
                <p>{item.blurb}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link className="linkish" to={GUIDE_PATH}>
        Rehber ve ilan ver
      </Link>
    </aside>
  )
}
