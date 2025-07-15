'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useCallback } from 'react'

import { useAuth } from '@/contexts/AuthContext'

// Routes that don't require age verification
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-age',
  '/terms',
  '/privacy',
  '/about',
  '/',
  '/watch',
  '/search',
]

// Routes that are allowed for non-verified users
const ALLOWED_UNVERIFIED_ROUTES = [...PUBLIC_ROUTES, '/auth/logout']

export function useAgeVerification() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const navigateTo = useCallback(
    (url: string) => {
      router.push(url)
    },
    [router]
  )

  // Calculate if user needs age verification synchronously
  const needsAgeVerification = !loading && user && userProfile && !userProfile.ageVerified

  useEffect(() => {
    // Don't do anything while loading
    if (loading || !pathname) return

    // Allow access to public routes (including dynamic routes)
    if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/watch/')) return

    // Must have user to proceed
    if (!user) {
      navigateTo('/auth/login')
      return
    }

    // Must have user profile to proceed
    if (!userProfile) return

    // Check age verification
    if (!userProfile.ageVerified) {
      if (ALLOWED_UNVERIFIED_ROUTES.includes(pathname) || pathname.startsWith('/watch/')) return

      navigateTo('/auth/verify-age')
      return
    }

    // Check if adult
    if (userProfile.isAdult === false) {
      navigateTo('/auth/login?error=underage')
      return
    }
  }, [user, userProfile, loading, pathname, router, navigateTo])

  return {
    user,
    userProfile,
    loading,
    isAgeVerified: userProfile?.ageVerified || false,
    isAdult: userProfile?.isAdult || false,
    needsAgeVerification,
  }
}
