'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AgeVerificationAlert } from '@/components/AgeVerificationAlert'
import { useAgeVerification } from '@/lib/hooks/useAgeVerification'
import { useGuestAgeVerification } from '@/lib/hooks/useGuestAgeVerification'
import { useAppSelector } from '@/lib/store/hooks'

// Routes that don't require age verification
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/recovery',
  '/auth/verify-age',
  '/terms',
  '/privacy',
  '/about',
  '/',
  '/watch',
  '/search',
  '/profile',
]

export function ClientLayout({ children }: { children: React.ReactNode }) {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL, UNCONDITIONALLY
  const { user, userProfile, loading } = useAppSelector(state => state.auth)
  const { needsAgeVerification } = useAgeVerification()
  const { showAlert, confirmAge, isLoading: isGuestLoading } = useGuestAgeVerification()
  const pathname = usePathname()
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Check if current path is public (including dynamic routes)
  const isPublicRoute = (path: string) => {
    return (
      PUBLIC_ROUTES.includes(path) || path.startsWith('/watch/') || path.startsWith('/profile/')
    )
  }

  // Handle guest age verification for non-authenticated users
  const handleGuestAgeConfirm = () => {
    confirmAge()
  }

  // ALL useEffect HOOKS MUST BE CALLED UNCONDITIONALLY
  // Immediately redirect if needed (before any render)
  useEffect(() => {
    if (!loading && pathname && !isPublicRoute(pathname) && isHydrated) {
      if (!user) {
        router.replace('/auth/login')
        return
      }

      if (user && userProfile && !userProfile.ageVerified) {
        router.replace('/auth/verify-age')
        return
      }

      if (user && userProfile && userProfile.ageVerified && userProfile.isAdult === false) {
        router.replace('/auth/login?error=underage')
        return
      }
    }
  }, [loading, pathname, user, userProfile, router, isHydrated])

  // No need for redirection effect since we only have confirm button

  // Show loading while auth is loading or hydrating
  if (!isHydrated || loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-2 text-muted-foreground'>Cargando...</p>
        </div>
      </div>
    )
  }

  // Allow public routes (only after hydration)
  if (!pathname || isPublicRoute(pathname)) {
    // For guest users (not logged in), show age verification alert
    if (!user && !isGuestLoading) {
      // Show age verification modal over the content
      return (
        <div className='relative'>
          {/* Background content */}
          <div className={`${showAlert ? 'pointer-events-none' : ''}`}>{children}</div>

          {/* Age verification modal */}
          {showAlert && (
            <AgeVerificationAlert isOpen={showAlert} onConfirm={handleGuestAgeConfirm} />
          )}
        </div>
      )
    }
    return <>{children}</>
  }

  // Block any protected route if user needs age verification
  if (needsAgeVerification) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-2 text-muted-foreground'>Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // If user is verified but underage, show loading (hook will redirect)
  if (user && userProfile && userProfile.ageVerified && userProfile.isAdult === false) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-2 text-muted-foreground'>Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // All checks passed, show the app
  return <>{children}</>
}
