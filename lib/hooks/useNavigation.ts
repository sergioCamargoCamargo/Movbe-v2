'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import {
  closeSidebar,
  setNavigating,
  setPageTransitioning,
  setDestinationUrl,
} from '@/lib/store/slices/sidebarSlice'

export function useNavigation() {
  const dispatch = useAppDispatch()
  const { isOpen: isSidebarOpen } = useAppSelector(state => state.sidebar)
  const router = useRouter()
  const pathname = usePathname()

  const navigateTo = useCallback(
    (url: string) => {
      // If it's the same page, just close sidebar if open
      if (pathname === url) {
        if (isSidebarOpen) {
          dispatch(closeSidebar())
        }
        return
      }

      // Set the destination URL to show the correct skeleton
      dispatch(setDestinationUrl(url))
      dispatch(setPageTransitioning(true))

      if (isSidebarOpen) {
        // If the sidebar is open, close it first
        dispatch(closeSidebar())
        dispatch(setNavigating(true))

        // Minimal delay for smoother UX
        setTimeout(() => {
          router.push(url)
        }, 100) // Much faster - just enough for sidebar to start closing
      } else {
        // If the sidebar is closed, navigate immediately
        router.push(url)
      }
    },
    [dispatch, isSidebarOpen, pathname, router]
  )

  return { navigateTo }
}
