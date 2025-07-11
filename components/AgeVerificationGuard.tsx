'use client'

import { useAgeVerification } from '@/lib/hooks/useAgeVerification'

interface AgeVerificationGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AgeVerificationGuard({ children, fallback }: AgeVerificationGuardProps) {
  const { loading } = useAgeVerification()

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
            <p className='mt-2 text-muted-foreground'>Verificando autenticación...</p>
          </div>
        </div>
      )
    )
  }

  // If age verification is needed, the hook will handle redirection
  // This component just renders children for verified users
  return <>{children}</>
}
