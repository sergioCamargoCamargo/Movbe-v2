'use client'

import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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
import { UserService } from '@/lib/services/UserService'
import { Validator } from '@/lib/utils/validation'
import { authRateLimiter, getUserIdentifier, formatTimeRemaining } from '@/lib/utils/rateLimiter'

export default function RegisterPage() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [birthDate, setBirthDate] = useState('')
  const [ageWarning, setAgeWarning] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const router = useRouter()
  const userService = new UserService()

  // Función para calcular la edad
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return null

    const birthDateObj = new Date(birthDateStr)
    const today = new Date()
    let age = today.getFullYear() - birthDateObj.getFullYear()
    const monthDiff = today.getMonth() - birthDateObj.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--
    }

    return age
  }

  // Manejar cambio en fecha de nacimiento
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBirthDate = e.target.value
    setBirthDate(newBirthDate)

    const age = calculateAge(newBirthDate)
    if (age !== null && age < 18) {
      setAgeWarning(t('auth.minimumAgeError'))
    } else {
      setAgeWarning('')
    }
  }

  // Manejar validación de contraseña en tiempo real
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value

    if (password.length > 0) {
      const passwordValidation = Validator.passwordStrength(password)
      setPasswordError(passwordValidation || '')
      setShowPasswordRequirements(true)
    } else {
      setPasswordError('')
      setShowPasswordRequirements(false)
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Check rate limiting
    const userIdentifier = getUserIdentifier()
    if (authRateLimiter.isRateLimited(userIdentifier)) {
      const timeRemaining = authRateLimiter.getTimeUntilReset(userIdentifier)
      setError(
        `Demasiados intentos de registro. Intenta de nuevo en ${formatTimeRemaining(timeRemaining)}.`
      )
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData(event.currentTarget)
      const firstName = formData.get('firstName') as string
      const lastName = formData.get('lastName') as string
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const birthDate = formData.get('birthDate') as string
      const termsAccepted = formData.get('terms') === 'on'
      const displayName = `${firstName} ${lastName}`

      // Calcular si el usuario es mayor de 18 años
      const age = calculateAge(birthDate)
      const isAdult = age !== null && age >= 18

      // Verificar que el usuario sea mayor de edad
      if (!isAdult) {
        setError(t('auth.minimumAgeError'))
        return
      }

      // Validar contraseña antes de enviar a Firebase
      const passwordValidation = Validator.passwordStrength(password)
      if (passwordValidation) {
        setError(passwordValidation)
        return
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (displayName && user) {
        await updateProfile(user, { displayName })
      }

      // Save user profile and terms acceptance using UserService
      await userService.createUserProfile(user.uid, {
        email,
        displayName,
        firstName,
        lastName,
        termsAccepted,
        photoURL: user.photoURL,
        dateOfBirth: birthDate,
        isAdult,
      })

      // Send email verification
      await sendEmailVerification(user)
      setSuccess(t('auth.accountCreatedSuccess'))

      // Clear rate limit on successful registration
      authRateLimiter.clearAttempts(userIdentifier)

      // Don't redirect immediately, let user see the success message
    } catch (error) {
      // Record failed attempt for rate limiting
      authRateLimiter.recordAttempt(userIdentifier)

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
      const { EnhancedUserService } = await import('@/lib/services/EnhancedUserService')
      const userService = new EnhancedUserService()
      const userProfile = await userService.createOrUpdateUser(result.user)

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
          width={96}
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
            <CardTitle className='text-xl sm:text-2xl text-center'>
              {t('auth.createAccount')}
            </CardTitle>
            <CardDescription className='text-center text-sm sm:text-base'>
              {t('auth.registerDescription')}
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
                  <Label htmlFor='firstName'>{t('auth.firstName')}</Label>
                  <Input id='firstName' name='firstName' required disabled={isLoading} />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lastName'>{t('auth.lastName')}</Label>
                  <Input id='lastName' name='lastName' required disabled={isLoading} />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>{t('auth.email')}</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='birthDate'>{t('auth.birthDate')}</Label>
                <Input
                  id='birthDate'
                  name='birthDate'
                  type='date'
                  value={birthDate}
                  onChange={handleBirthDateChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  disabled={isLoading}
                  className={ageWarning ? 'border-red-500' : ''}
                />
                {ageWarning && (
                  <Alert variant='destructive'>
                    <AlertDescription>{ageWarning}</AlertDescription>
                  </Alert>
                )}
                <p className='text-xs text-muted-foreground'>{t('auth.birthDateHelp')}</p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='password'>{t('auth.password')}</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    onChange={handlePasswordChange}
                    className={passwordError ? 'border-red-500' : ''}
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

                {/* Password requirements */}
                {showPasswordRequirements && (
                  <div className='text-xs space-y-1'>
                    <p className='font-medium text-muted-foreground'>Requisitos de contraseña:</p>
                    <ul className='list-disc list-inside space-y-1 text-muted-foreground pl-2'>
                      <li>Al menos 12 caracteres</li>
                      <li>Una letra mayúscula</li>
                      <li>Una letra minúscula</li>
                      <li>Un número</li>
                      <li>Un símbolo (!@#$%^&amp;*(),.?&quot;:{}|&lt;&gt;)</li>
                      <li>Sin caracteres repetidos consecutivos</li>
                    </ul>
                  </div>
                )}

                {passwordError && (
                  <Alert variant='destructive'>
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
              </div>
              <div className='flex items-center space-x-2'>
                <div className='relative'>
                  <Checkbox
                    id='terms'
                    name='terms'
                    required
                    className='scale-50 origin-left mt-1'
                  />
                </div>
                <Label htmlFor='terms' className='text-xs sm:text-sm leading-tight flex-1 -ml-2'>
                  {t('auth.acceptTerms')}{' '}
                  <Link href='/terms' className='text-primary hover:underline'>
                    {t('auth.termsAndConditions')}
                  </Link>
                </Label>
              </div>
              <div className='space-y-4'>
                <Button
                  className='w-full'
                  disabled={isLoading || ageWarning !== '' || passwordError !== ''}
                >
                  {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
                </Button>
                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t'></div>
                  </div>
                  <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-background px-2 text-muted-foreground'>
                      {t('auth.orRegisterWith')}
                    </span>
                  </div>
                </div>
                <Button
                  variant='outline'
                  disabled={isLoading}
                  onClick={handleGoogleLogin}
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
                  {t('auth.continueWithGoogle')}
                </Button>
              </div>
            </CardContent>
          </form>
          <CardFooter className='flex flex-col items-center px-4 sm:px-6'>
            <p className='text-xs sm:text-sm text-muted-foreground text-center'>
              {t('auth.alreadyHaveAccount')}{' '}
              <Link href='/auth/login' className='text-primary hover:underline'>
                {t('auth.signIn')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
