export function googleDir(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export function yandexDir(lat: number, lng: number): string {
  return `https://yandex.com/maps/?rtext=~${lat},${lng}&rtt=auto`
}

export function appleDir(lat: number, lng: number): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}`
}

export function googlePano(lat: number, lng: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
}
