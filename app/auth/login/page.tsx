'use client'

import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth, getFirebaseErrorMessage } from '@/lib/firebase'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams?.get('error')
    if (errorParam === 'underage') {
      setError(
        'No puedes acceder a esta plataforma. Debes ser mayor de 18 años para usar nuestros servicios.'
      )
    }
  }, [searchParams])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const formData = new FormData(event.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      if (!userCredential.user.emailVerified) {
        setError(
          'Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.'
        )
        await auth.signOut() // Sign out the unverified user
        return
      }

      router.push('/')
    } catch (error) {
      setError(getFirebaseErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setIsLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account',
      })
      const result = await signInWithPopup(auth, provider)

      // Check if this is a new user or existing user without age verification
      const { createOrUpdateUser } = await import('@/lib/firestore')
      const userProfile = await createOrUpdateUser(result.user)

      if (!userProfile?.ageVerified) {
        // Redirect directly to age verification
        router.push('/auth/verify-age')
      } else if (userProfile.ageVerified && userProfile.isAdult === false) {
        // User is underage
        router.push('/auth/login?error=underage')
      } else {
        // User is verified and adult, go to home
        router.push('/')
      }
    } catch (error) {
      setError(getFirebaseErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-muted/50 p-2 sm:p-4 relative overflow-y-auto mobile-scroll-container ios-scroll-fix'>
      {/* Logo - top left */}
      <Link href='/' className='absolute top-4 left-4 z-10'>
        <Image
          src='/logo_black.png'
          alt='Movbe'
          width={100}
          height={32}
          className='dark:hidden w-24 h-auto'
        />
        <Image
          src='/logo_white.png'
          alt='Movbe'
          width={100}
          height={32}
          className='hidden dark:block w-24 h-auto'
        />
      </Link>

      <div className='min-h-screen flex items-center justify-center'>
        <Card className='w-full max-w-md mx-2 sm:mx-0 relative'>
          {/* Back arrow - top left of form */}
          <Button
            variant='ghost'
            size='icon'
            className='absolute top-4 left-4 z-10'
            onClick={() => router.back()}
          >
            <ArrowLeft className='h-6 w-6' />
          </Button>

          <CardHeader className='space-y-1 px-4 sm:px-6'>
            <CardTitle className='text-xl sm:text-2xl text-center'>Iniciar sesión</CardTitle>
            <CardDescription className='text-center text-sm sm:text-base'>
              Ingresa tus credenciales para acceder
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className='space-y-4 px-4 sm:px-6'>
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
              <div className='space-y-2'>
                <Label htmlFor='password'>Contraseña</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  </Button>
                </div>
              </div>
              <div className='flex items-center justify-end'>
                <Link href='/auth/recovery' className='text-sm text-primary hover:underline'>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className='space-y-4'>
                <Button className='w-full' disabled={isLoading}>
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </Button>
                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t'></div>
                  </div>
                  <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-background px-2 text-muted-foreground'>O continúa con</span>
                  </div>
                </div>
                <Button
                  variant='outline'
                  disabled={isLoading}
                  onClick={handleGoogleLogin}
                  type='button'
                  className='w-full'
                >
                  <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
                    <path
                      fill='currentColor'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='currentColor'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                  Continuar con Google
                </Button>
              </div>
            </CardContent>
          </form>
          <CardFooter className='flex flex-col items-center px-4 sm:px-6'>
            <p className='text-xs sm:text-sm text-muted-foreground text-center'>
              ¿No tienes una cuenta?{' '}
              <Link href='/auth/register' className='text-primary hover:underline'>
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
