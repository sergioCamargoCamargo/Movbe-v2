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

        // Wait less time for a faster transition
        setTimeout(() => {
          router.push(url)
        }, 400) // Reduced from 700ms to 400ms
      } else {
        // If the sidebar is closed, add a small transition
        setTimeout(() => {
          router.push(url)
        }, 150) // Small pause to smooth out
      }
    },
    [dispatch, isSidebarOpen, pathname, router]
  )

  return { navigateTo }
}
