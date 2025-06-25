import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface UiState {
  toasts: Toast[]
  isLoading: boolean
  loadingMessage?: string
  globalError: string | null
}

const initialState: UiState = {
  toasts: [],
  isLoading: false,
  loadingMessage: undefined,
  globalError: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Toast>) => {
      state.toasts.push(action.payload)
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload)
    },
    clearToasts: state => {
      state.toasts = []
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
      if (!action.payload) {
        state.loadingMessage = undefined
      }
    },
    setLoadingMessage: (state, action: PayloadAction<string | undefined>) => {
      state.loadingMessage = action.payload
    },
    setGlobalError: (state, action: PayloadAction<string | null>) => {
      state.globalError = action.payload
    },
    clearGlobalError: state => {
      state.globalError = null
    },
  },
})

export const {
  addToast,
  removeToast,
  clearToasts,
  setLoading,
  setLoadingMessage,
  setGlobalError,
  clearGlobalError,
} = uiSlice.actions

export default uiSlice.reducer
