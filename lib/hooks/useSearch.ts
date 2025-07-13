import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import {
  performSearch,
  setQuery,
  clearSearch,
  clearResults,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from '@/lib/store/slices/searchSlice'

export const useSearch = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const { query, results, loading, error, hasSearched, suggestions, recentSearches } =
    useAppSelector(state => state.search)

  // Función para realizar búsqueda
  const search = useCallback(
    async (searchQuery?: string, limit?: number) => {
      const queryToSearch = searchQuery || query
      if (!queryToSearch.trim()) return

      await dispatch(performSearch({ query: queryToSearch, limit }))
    },
    [dispatch, query]
  )

  // Función para buscar y navegar a página de resultados
  const searchAndNavigate = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return

      dispatch(setQuery(searchQuery))
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    },
    [dispatch, router]
  )

  // Función para actualizar query
  const updateQuery = useCallback(
    (newQuery: string) => {
      dispatch(setQuery(newQuery))
    },
    [dispatch]
  )

  // Función para limpiar búsqueda
  const clear = useCallback(() => {
    dispatch(clearSearch())
  }, [dispatch])

  // Función para limpiar solo resultados
  const clearSearchResults = useCallback(() => {
    dispatch(clearResults())
  }, [dispatch])

  // Función para agregar búsqueda reciente
  const addToRecentSearches = useCallback(
    (searchQuery: string) => {
      dispatch(addRecentSearch(searchQuery))
    },
    [dispatch]
  )

  // Función para remover búsqueda reciente
  const removeFromRecentSearches = useCallback(
    (searchQuery: string) => {
      dispatch(removeRecentSearch(searchQuery))
    },
    [dispatch]
  )

  // Función para limpiar búsquedas recientes
  const clearAllRecentSearches = useCallback(() => {
    dispatch(clearRecentSearches())
  }, [dispatch])

  // Función para búsqueda instantánea (conforme se escribe)
  const instantSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length >= 2) {
        await dispatch(performSearch({ query: searchQuery.trim(), limit: 10 }))
      } else {
        dispatch(clearResults())
      }
    },
    [dispatch]
  )

  // Hook para manejar URL search params
  const initializeFromUrl = useCallback(
    (urlQuery: string) => {
      if (urlQuery) {
        dispatch(setQuery(urlQuery))
        search(urlQuery)
      }
    },
    [dispatch, search]
  )

  return {
    // Estado
    query,
    results,
    loading,
    error,
    hasSearched,
    suggestions,
    recentSearches,
    hasResults: results.length > 0,

    // Acciones
    search,
    searchAndNavigate,
    updateQuery,
    clear,
    clearSearchResults,
    addToRecentSearches,
    removeFromRecentSearches,
    clearAllRecentSearches,
    instantSearch,
    initializeFromUrl,
  }
}
