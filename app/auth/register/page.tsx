'use client'

import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth, getFirebaseErrorMessage } from '@/lib/firebase'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData(event.currentTarget)
      const firstName = formData.get('firstName') as string
      const lastName = formData.get('lastName') as string
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const displayName = `${firstName} ${lastName}`

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName })
      }

      // Send email verification
      await sendEmailVerification(userCredential.user)
      setSuccess(
        'Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta antes de iniciar sesión.'
      )

      // Don't redirect immediately, let user see the success message
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
          <CardTitle className='text-xl sm:text-2xl text-center'>Crear cuenta</CardTitle>
          <CardDescription className='text-center text-sm sm:text-base'>
            Ingresa tus datos para registrarte
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className='space-y-4 px-4 sm:px-6'>
            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant='default' className='border-green-200 bg-green-50 text-green-800'>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>Nombre</Label>
                <Input id='firstName' name='firstName' required disabled={isLoading} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>Apellido</Label>
                <Input id='lastName' name='lastName' required disabled={isLoading} />
              </div>
            </div>
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
            <div className='flex items-center space-x-2'>
              <Checkbox id='terms' name='terms' required />
              <Label htmlFor='terms' className='text-xs sm:text-sm leading-tight'>
                Acepto los{' '}
                <Link href='#' className='text-primary hover:underline'>
                  términos y condiciones
                </Link>
              </Label>
            </div>
            <div className='space-y-4'>
              <Button className='w-full' disabled={isLoading}>
                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t'></div>
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-2 text-muted-foreground'>O regístrate con</span>
                </div>
              </div>
              <Button
                variant='outline'
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className='w-full'
              >
                <Google className='mr-2 h-4 w-4' />
                Google
              </Button>
            </div>
          </CardContent>
        </form>
        <CardFooter className='flex flex-col items-center px-4 sm:px-6'>
          <p className='text-xs sm:text-sm text-muted-foreground text-center'>
            ¿Ya tienes una cuenta?{' '}
            <Link href='/auth/login' className='text-primary hover:underline'>
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
