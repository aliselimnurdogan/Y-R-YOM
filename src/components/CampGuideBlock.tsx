import type { FacilityFlag, FireFlag, FirewoodFlag, PlaceItem, ShopFlag } from '../types'

const TOILET: Record<FacilityFlag, string> = { var: 'Var', yok: 'Yok', belirsiz: 'Bilinmiyor' }
const POWER: Record<FacilityFlag, string> = { var: 'Var', yok: 'Yok', belirsiz: 'Bilinmiyor' }
const WATER: Record<FacilityFlag, string> = { var: 'Var', yok: 'Yok', belirsiz: 'Bilinmiyor' }
const WOOD: Record<FirewoodFlag, string> = {
  getir: 'Yanına al',
  yerinde: 'İşletmeden',
  yasak: 'Yasak',
  belirsiz: 'Bilinmiyor',
}
const FIRE: Record<FireFlag, string> = { yasak: 'Yasak', ocak: 'Yalnız ocak', belirsiz: 'Bilinmiyor' }
const SHOP: Record<ShopFlag, string> = { var: 'Var', yok: 'Yok', yakin: 'Yakında', belirsiz: 'Bilinmiyor' }

function tone(value: string): string {
  if (value === 'var' || value === 'yerinde' || value === 'yakin') return 'is-yes'
  if (value === 'yok' || value === 'yasak') return 'is-no'
  if (value === 'getir' || value === 'ocak') return 'is-warn'
  return 'is-unknown'
}

export function CampGuideBlock({ place }: { place: PlaceItem }) {
  const guide = place.guide
  if (!guide) return null

  const amenities: Array<{ label: string; value: string; text: string }> = [
    { label: 'Tuvalet', value: guide.toilet, text: TOILET[guide.toilet] },
    { label: 'Priz', value: guide.power, text: POWER[guide.power] },
    { label: 'Su', value: guide.water, text: WATER[guide.water] },
    { label: 'Odun', value: guide.firewood, text: WOOD[guide.firewood] },
    { label: 'Ateş', value: guide.fire, text: FIRE[guide.fire] },
    { label: 'Market', value: guide.shop, text: SHOP[guide.shop] },
  ]

  return (
    <section className="guide-block">
      <p className="guide-kicker">{guide.difficulty}</p>
      <p className="guide-advice">{guide.advice}</p>
      <dl className="amenity-grid">
        {amenities.map((item) => (
          <div key={item.label} className={`amenity ${tone(item.value)}`}>
            <dt>{item.label}</dt>
            <dd>{item.text}</dd>
          </div>
        ))}
      </dl>
      <div className="guide-split">
        <div>
          <h2 className="section-title">Güzel yanları</h2>
          <ul className="guide-list is-good">
            {guide.pros.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="section-title">Zorluklar</h2>
          <ul className="guide-list is-hard">
            {guide.cons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <h2 className="section-title">Ne yapmalı</h2>
      <ol className="guide-steps">
        {guide.tips.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      {place.id === 'yedigoller-mp' && (
        <p className="guide-link">
          Rezervasyon:{' '}
          <a href="https://www.yedigollermillipark.com/ev-turu/kamp-alani/" rel="noreferrer" target="_blank">
            Habitat kamp alanı
          </a>
          . Kapıda yer beklenmez; karavan alınmaz.
        </p>
      )}
      <p className="guide-disclaimer">
        Tesis bilgisi zamanla değişir. Bu sayfa rezervasyon veya yangın raporu değildir. Gitmeden ilgili DKMP
        bölge müdürlüğünü veya gişeyi arayın.
      </p>
    </section>
  )
}
