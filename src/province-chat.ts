export interface ChatLine {
  id: string
  province: string
  name: string
  text: string
  createdAt: string
}

const KEY = 'yuruyom-il-sohbet-v1'
const CHANNEL = 'yuruyom-il-sohbet'
const MAX = 80

function asLine(raw: unknown): ChatLine | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>
  if (typeof record.id !== 'string' || typeof record.province !== 'string') return null
  if (typeof record.name !== 'string' || typeof record.text !== 'string') return null
  if (typeof record.createdAt !== 'string') return null
  return {
    id: record.id,
    province: record.province,
    name: record.name,
    text: record.text,
    createdAt: record.createdAt,
  }
}

function loadAll(): ChatLine[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map(asLine).filter((item): item is ChatLine => item !== null)
  } catch {
    return []
  }
}

export function loadChat(province: string): ChatLine[] {
  return loadAll()
    .filter((item) => item.province === province)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-MAX)
}

export function saveChat(line: ChatLine): ChatLine[] {
  const all = loadAll().filter((item) => item.id !== line.id)
  all.push(line)
  localStorage.setItem(KEY, JSON.stringify(all.slice(-MAX * 4)))
  try {
    const channel = new BroadcastChannel(CHANNEL)
    channel.postMessage({ province: line.province })
    channel.close()
  } catch {
    /* ignore */
  }
  return loadChat(line.province)
}

export function subscribeChat(province: string, onChange: (lines: ChatLine[]) => void): () => void {
  const refresh = () => onChange(loadChat(province))
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) refresh()
  }
  window.addEventListener('storage', onStorage)
  let channel: BroadcastChannel | null = null
  try {
    channel = new BroadcastChannel(CHANNEL)
    channel.onmessage = (event: MessageEvent<{ province?: string }>) => {
      if (!event.data?.province || event.data.province === province) refresh()
    }
  } catch {
    channel = null
  }
  return () => {
    window.removeEventListener('storage', onStorage)
    channel?.close()
  }
}

export function nickKey(): string {
  try {
    const saved = sessionStorage.getItem('yuruyom-nick')
    if (saved) return saved
  } catch {
    /* ignore */
  }
  return ''
}

export function saveNick(name: string) {
  try {
    sessionStorage.setItem('yuruyom-nick', name)
  } catch {
    /* ignore */
  }
}
