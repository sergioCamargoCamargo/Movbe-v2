'use client'

import { CalendarIcon, Shield, UserCheck } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useNavigation } from '@/lib/hooks/useNavigation'
import { UserService } from '@/lib/services/UserService'

export default function VerifyAgePage() {
  const { userProfile, user, loading, refreshUserProfile } = useAuth()
  const { navigateTo } = useNavigation()
  const { toast } = useToast()
  const [birthDate, setBirthDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Redirect if user is already verified or not logged in
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigateTo('/auth/login')
        return
      }

      if (userProfile?.ageVerified) {
        navigateTo('/')
        return
      }
    }
  }, [user, userProfile, loading, navigateTo])

  const calculateAge = (birthDate: string): number => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !userProfile) {
      toast({
        title: 'Error de autenticación',
        description: 'Por favor, inicia sesión nuevamente',
        variant: 'destructive',
      })
      return
    }

    if (!birthDate) {
      toast({
        title: 'Fecha requerida',
        description: 'Por favor, ingresa tu fecha de nacimiento',
        variant: 'destructive',
      })
      return
    }

    if (!acceptedTerms) {
      toast({
        title: 'Términos requeridos',
        description: 'Debes aceptar los términos y condiciones para continuar',
        variant: 'destructive',
      })
      return
    }

    const age = calculateAge(birthDate)

    if (age < 18) {
      toast({
        title: 'Edad insuficiente',
        description: 'Debes ser mayor de 18 años para usar esta plataforma',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const userService = new UserService()
      await userService.updateUserProfile(user.uid, {
        dateOfBirth: birthDate,
        ageVerified: true,
        isAdult: age >= 18,
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
      })

      // Refresh user profile to get updated data
      await refreshUserProfile()

      toast({
        title: 'Verificación completada',
        description: 'Tu edad ha sido verificada exitosamente',
      })

      // Redirect to home page
      navigateTo('/')
    } catch {
      // Error updating user profile
      toast({
        title: 'Error',
        description: 'Hubo un problema al verificar tu edad. Intenta nuevamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 13) // Minimum 13 years old to even select

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-2 text-muted-foreground'>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4'>
            <Shield className='h-8 w-8 text-primary' />
          </div>
          <CardTitle className='text-2xl font-bold'>Verificación de Edad</CardTitle>
          <CardDescription className='text-center'>
            Para cumplir con nuestras políticas, necesitamos verificar que eres mayor de 18 años
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='birthDate' className='flex items-center gap-2'>
                <CalendarIcon className='h-4 w-4' />
                Fecha de Nacimiento
              </Label>
              <Input
                id='birthDate'
                type='date'
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                max={maxDate.toISOString().split('T')[0]}
                required
                className='w-full'
              />
              {birthDate && (
                <p className='text-sm text-muted-foreground'>
                  Edad calculada: {calculateAge(birthDate)} años
                </p>
              )}
            </div>

            <div className='space-y-4'>
              <div className='flex items-start space-x-2'>
                <input
                  type='checkbox'
                  id='terms'
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  className='mt-1'
                  required
                />
                <label htmlFor='terms' className='text-sm text-muted-foreground leading-relaxed'>
                  Acepto los{' '}
                  <a href='/terms' target='_blank' className='text-primary hover:underline'>
                    Términos y Condiciones
                  </a>{' '}
                  y confirmo que soy mayor de 18 años
                </label>
              </div>
            </div>

            <Button
              type='submit'
              className='w-full flex items-center gap-2'
              disabled={isSubmitting || !birthDate || !acceptedTerms}
            >
              {isSubmitting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Verificando...
                </>
              ) : (
                <>
                  <UserCheck className='h-4 w-4' />
                  Verificar Edad
                </>
              )}
            </Button>
          </form>

          <div className='mt-6 p-4 bg-muted/30 rounded-lg'>
            <div className='flex items-start gap-3'>
              <Shield className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
              <div className='space-y-1'>
                <p className='text-sm font-medium'>¿Por qué necesitamos verificar tu edad?</p>
                <p className='text-xs text-muted-foreground'>
                  Nuestra plataforma contiene contenido para adultos y cumplimos con regulaciones
                  internacionales que requieren verificación de edad para usuarios mayores de 18
                  años.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
