import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { focusFromSuggestion, type GeoFocus, type GeoSuggestion } from './admin-geo'
import type { DiscoverIntent } from './intents'

interface SearchState {
  query: string
  setQuery: (query: string) => void
  intent: DiscoverIntent | null
  setIntent: (intent: DiscoverIntent | null) => void
  focus: GeoFocus | null
  setFocus: (focus: GeoFocus | null) => void
  pickSuggestion: (item: GeoSuggestion) => void
}

const SearchContext = createContext<SearchState | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('')
  const [intent, setIntent] = useState<DiscoverIntent | null>(null)
  const [focus, setFocus] = useState<GeoFocus | null>(null)

  const value = useMemo<SearchState>(
    () => ({
      query,
      setQuery,
      intent,
      setIntent,
      focus,
      setFocus,
      pickSuggestion: (item) => {
        setFocus(focusFromSuggestion(item))
        setQuery('')
      },
    }),
    [query, intent, focus],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch(): SearchState {
  const context = useContext(SearchContext)
  if (!context) throw new Error('Arama hazır değil')
  return context
}
