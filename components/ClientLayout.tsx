'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { useAgeVerification } from '@/lib/hooks/useAgeVerification'

// Routes that don't require age verification
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-age',
  '/terms',
  '/privacy',
  '/about',
]

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth()
  const { needsAgeVerification } = useAgeVerification()
  const pathname = usePathname()
  const router = useRouter()

  // Immediately redirect if needed (before any render)
  useEffect(() => {
    if (!loading && pathname && !PUBLIC_ROUTES.includes(pathname)) {
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
  }, [loading, pathname, user, userProfile, router])

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-2 text-muted-foreground'>Cargando...</p>
        </div>
      </div>
    )
  }

  // Allow public routes
  if (!pathname || PUBLIC_ROUTES.includes(pathname)) {
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
