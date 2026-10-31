import { zoneOfProvince } from './provinces'

const ZONE_NOTE: Record<string, string> = {
  Marmara: 'Marmara’nın kıyı, ada ve orman kenarı durakları. Yazın kalabalık, kışın ıslak; pin izin değildir.',
  Ege: 'Ege’de zeytin, kanyon ve sahil bir arada durur. Yaz sıcağı erken başlar; suyu yanına al.',
  Akdeniz: 'Akdeniz’de sahil ile Toros etekleri aynı günde değişir. Yazın bunaltıcı, yaylada serin.',
  Karadeniz: 'Karadeniz sisli, yeşil ve ıslak. Yayla ve fındık sırtları; çamur ve yağmura hazırlan.',
  'İç Anadolu': 'İç Anadolu açık, rüzgarlı bozkır. Göl ve peri bacası kenarı; gölge azdır.',
  'Doğu Anadolu': 'Doğu Anadolu yüksek ve serin. Yaz kısa, gece soğuk; dört mevsim tulum düşün.',
  'Güneydoğu Anadolu': 'Güneydoğu’da taş, vadi ve sıcak ova. Yazın erken çık, suyu bitirme.',
}

export function fallbackProvinceNote(name: string): string {
  const zone = zoneOfProvince(name)
  const tail = zone ? ZONE_NOTE[zone] : 'Pin izin değildir; ormanda geceleme yalnız tahsisli yerde.'
  return `${name}. ${tail}`
}

export function trimExtract(extract: string, limit = 420): string {
  const clean = extract.replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean
  const cut = clean.slice(0, limit)
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('。'))
  return `${(stop > 120 ? cut.slice(0, stop + 1) : cut).trim()}…`
}
