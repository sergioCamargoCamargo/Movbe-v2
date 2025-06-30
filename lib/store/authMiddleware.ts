import { onAuthStateChanged } from 'firebase/auth'

import { auth } from '@/lib/firebase'

import { setUser, setUserProfile, setLoading, refreshUserProfile } from './slices/authSlice'

import type { AppDispatch } from './index'

export const createAuthMiddleware = () => {
  let hasInitialized = false

  return (dispatch: AppDispatch) => {
    if (!hasInitialized) {
      hasInitialized = true

      const unsubscribe = onAuthStateChanged(auth, async authUser => {
        dispatch(setUser(authUser))

        if (authUser) {
          try {
            dispatch(refreshUserProfile(authUser))
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error refreshing user profile:', error)
            dispatch(setUserProfile(null))
            dispatch(setLoading(false))
          }
        } else {
          dispatch(setUserProfile(null))
          dispatch(setLoading(false))
        }
      })

      // Store the unsubscribe function for cleanup
      if (typeof window !== 'undefined') {
        ;(window as typeof window & { __authUnsubscribe__?: () => void }).__authUnsubscribe__ =
          unsubscribe
      }
    }
  }
}
