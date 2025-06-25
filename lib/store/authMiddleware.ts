import { onAuthStateChanged } from 'firebase/auth'

import { auth } from '@/lib/firebase'

import { setUser, setUserProfile, setLoading, refreshUserProfile } from './slices/authSlice'

type DispatchFunction = (action: any) => void

export const createAuthMiddleware = () => {
  let hasInitialized = false

  return (dispatch: DispatchFunction) => {
    if (!hasInitialized) {
      hasInitialized = true

      const unsubscribe = onAuthStateChanged(auth, async authUser => {
        dispatch(setUser(authUser))

        if (authUser) {
          try {
            dispatch(refreshUserProfile(authUser))
          } catch (error) {
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
        ;(window as any).__authUnsubscribe__ = unsubscribe
      }
    }
  }
}
