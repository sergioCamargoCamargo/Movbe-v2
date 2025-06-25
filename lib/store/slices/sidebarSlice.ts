import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SidebarState {
  isOpen: boolean
  isNavigating: boolean
  isPageTransitioning: boolean
  destinationUrl: string | null
}

const initialState: SidebarState = {
  isOpen: false,
  isNavigating: false,
  isPageTransitioning: false,
  destinationUrl: null,
}

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: state => {
      state.isOpen = !state.isOpen
    },
    openSidebar: state => {
      state.isOpen = true
    },
    closeSidebar: state => {
      state.isOpen = false
    },
    setNavigating: (state, action: PayloadAction<boolean>) => {
      state.isNavigating = action.payload
    },
    setPageTransitioning: (state, action: PayloadAction<boolean>) => {
      state.isPageTransitioning = action.payload
    },
    setDestinationUrl: (state, action: PayloadAction<string | null>) => {
      state.destinationUrl = action.payload
    },
    resetNavigation: state => {
      state.isNavigating = false
      state.isPageTransitioning = false
      state.destinationUrl = null
    },
  },
})

export const {
  toggleSidebar,
  openSidebar,
  closeSidebar,
  setNavigating,
  setPageTransitioning,
  setDestinationUrl,
  resetNavigation,
} = sidebarSlice.actions

export default sidebarSlice.reducer
