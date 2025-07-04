'use client'

import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { Eye, EyeOff, ChromeIcon as Google } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth, getFirebaseErrorMessage } from '@/lib/firebase'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

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
      await signInWithPopup(auth, provider)
      router.push('/')
    } catch (error) {
      setError(getFirebaseErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-muted/50 p-2 sm:p-4'>
      <Card className='w-full max-w-md mx-2 sm:mx-0'>
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
                <Google className='mr-2 h-4 w-4' />
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
  )
}
