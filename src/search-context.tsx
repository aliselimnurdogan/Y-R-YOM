import { createContext, useContext, useState, type ReactNode } from 'react'

interface SearchState {
  query: string
  setQuery: (query: string) => void
}

const SearchContext = createContext<SearchState | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('')
  return <SearchContext.Provider value={{ query, setQuery }}>{children}</SearchContext.Provider>
}

export function useSearch(): SearchState {
  const context = useContext(SearchContext)
  if (!context) throw new Error('Arama hazır değil')
  return context
}
