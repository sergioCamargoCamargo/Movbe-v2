import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

import { VideoService, Video } from '@/lib/services/VideoService'

export interface SearchState {
  query: string
  results: Video[]
  loading: boolean
  error: string | null
  hasSearched: boolean
  suggestions: string[]
  recentSearches: string[]
}

const initialState: SearchState = {
  query: '',
  results: [],
  loading: false,
  error: null,
  hasSearched: false,
  suggestions: [],
  recentSearches: [],
}

// Async thunk para búsqueda
export const performSearch = createAsyncThunk(
  'search/performSearch',
  async ({ query, limit = 20 }: { query: string; limit?: number }) => {
    if (!query.trim()) {
      return { results: [], query: query.trim() }
    }
    const videoService = new VideoService()
    const results = await videoService.searchVideos(query.trim(), limit)
    return { results, query: query.trim() }
  }
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
    clearSearch: state => {
      state.query = ''
      state.results = []
      state.error = null
      state.hasSearched = false
    },
    clearResults: state => {
      state.results = []
      state.hasSearched = false
      state.error = null
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim()
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches = [query, ...state.recentSearches.slice(0, 9)]
      }
    },
    removeRecentSearch: (state, action: PayloadAction<string>) => {
      state.recentSearches = state.recentSearches.filter(search => search !== action.payload)
    },
    clearRecentSearches: state => {
      state.recentSearches = []
    },
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload
    },
  },
  extraReducers: builder => {
    builder
      .addCase(performSearch.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.loading = false
        if (Array.isArray(action.payload)) {
          state.results = []
        } else {
          state.results = action.payload.results
          // Agregar a búsquedas recientes si tiene resultados
          if (action.payload.results.length > 0 && action.payload.query) {
            const query = action.payload.query
            if (!state.recentSearches.includes(query)) {
              state.recentSearches = [query, ...state.recentSearches.slice(0, 9)]
            }
          }
        }
        state.hasSearched = true
        state.error = null
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error al realizar la búsqueda'
        state.hasSearched = true
      })
  },
})

export const {
  setQuery,
  clearSearch,
  clearResults,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  setSuggestions,
} = searchSlice.actions

export default searchSlice.reducer
