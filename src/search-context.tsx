import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { GeoFocus, GeoSuggestion } from './admin-geo'
import { focusFromSuggestion } from './admin-geo'
import type { TourIntent } from './intents'

interface SearchState {
  query: string
  setQuery: (query: string) => void
  intent: TourIntent | null
  setIntent: (intent: TourIntent | null) => void
  geoPick: GeoFocus | null
  setGeoPick: (focus: GeoFocus | null) => void
  pickSuggestion: (item: GeoSuggestion) => void
}

const SearchContext = createContext<SearchState | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('')
  const [intent, setIntent] = useState<TourIntent | null>(null)
  const [geoPick, setGeoPick] = useState<GeoFocus | null>(null)

  const value = useMemo<SearchState>(
    () => ({
      query,
      setQuery,
      intent,
      setIntent,
      geoPick,
      setGeoPick,
      pickSuggestion: (item) => {
        setGeoPick(focusFromSuggestion(item))
        setQuery('')
      },
    }),
    [query, intent, geoPick],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch(): SearchState {
  const context = useContext(SearchContext)
  if (!context) throw new Error('Arama hazır değil')
  return context
}
