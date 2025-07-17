'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useService } from '@/components/ui/hooks/useService'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SERVICE_KEYS } from '@/lib/di/serviceRegistration'
import { getFirebaseErrorMessage } from '@/lib/firebase'
import { AuthService } from '@/lib/services/AuthService'

export default function RecoveryPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const authService = useService<AuthService>(SERVICE_KEYS.AUTH_SERVICE)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string

    try {
      await authService.resetPassword(email)
      setSuccess(true)
    } catch (error) {
      setError(getFirebaseErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-muted/50 p-4 overflow-y-auto mobile-scroll-container ios-scroll-fix'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl text-center'>Recuperar contraseña</CardTitle>
          <CardDescription className='text-center'>
            Ingresa tu correo electrónico para recuperar tu contraseña
          </CardDescription>
        </CardHeader>
        {success ? (
          <CardContent className='space-y-4'>
            <Alert>
              <AlertDescription>
                Se ha enviado un correo con las instrucciones para recuperar tu contraseña.
              </AlertDescription>
            </Alert>
            <Button className='w-full' variant='outline' onClick={() => router.push('/auth/login')}>
              Volver al inicio de sesión
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={onSubmit}>
            <CardContent className='space-y-4'>
              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className='space-y-2'>
                <Label htmlFor='email'>Correo electrónico</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='ejemplo@correo.com'
                  required
                  disabled={isLoading}
                />
              </div>
              <Button className='w-full' disabled={isLoading}>
                {isLoading ? 'Enviando instrucciones...' : 'Enviar instrucciones'}
              </Button>
            </CardContent>
          </form>
        )}
        <CardFooter className='flex flex-col items-center'>
          <p className='text-sm text-muted-foreground'>
            ¿Recordaste tu contraseña?{' '}
            <Link href='/auth/login' className='text-primary hover:underline'>
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
