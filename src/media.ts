/** Raise remote image quality without changing stored catalog URLs. */

function clean(url: string): string {
  return url.replace(/\?utm_source=.*$/, '')
}

export function sharpUrl(url: string, width: number): string {
  if (!url.startsWith('http')) return url
  const cap = Math.max(320, Math.min(width, 2048))
  try {
    if (url.includes('unsplash.com')) {
      const parsed = new URL(url)
      parsed.searchParams.set('q', '90')
      parsed.searchParams.set('w', String(cap))
      parsed.searchParams.set('auto', 'format')
      parsed.searchParams.set('fit', 'crop')
      parsed.searchParams.set('dpr', '2')
      return parsed.toString()
    }
    if (url.includes('wikimedia.org')) return clean(url)
  } catch {
    return url
  }
  return url
}

export function srcSet(url: string, widths: number[]): string | undefined {
  if (url.includes('wikimedia.org')) return undefined
  const value = widths.map((item) => `${sharpUrl(url, item)} ${item}w`).join(', ')
  return value.length > 0 ? value : undefined
}
