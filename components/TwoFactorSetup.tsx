'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, Phone, Check, X, AlertCircle, Eye, EyeOff } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { twoFactorService } from '@/lib/services/TwoFactorService'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { TwoFactorSetupProps, SetupStep } from '@/lib/types/components/TwoFactorTypes'

export default function TwoFactorSetup({ user, onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>('check')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [enrolledFactors, setEnrolledFactors] = useState<{ uid: string; phoneNumber?: string }[]>(
    []
  )
  const [requiresPassword, setRequiresPassword] = useState(false)
  const { trackAuth, trackInteraction, trackCustomEvent } = useAnalytics()

  useEffect(() => {
    checkTwoFactorStatus()
    checkPasswordRequirement()

    // Cleanup on unmount
    return () => {
      twoFactorService.cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkTwoFactorStatus = useCallback(async () => {
    setLoading(true)
    try {
      const enabled = await twoFactorService.is2FAEnabled(user)
      const factors = await twoFactorService.getEnrolledFactors(user)

      setIs2FAEnabled(enabled)
      setEnrolledFactors(factors)
    } catch {
      setError('Error verificando estado de 2FA')
    } finally {
      setLoading(false)
    }
  }, [user])

  const checkPasswordRequirement = useCallback(() => {
    // Check if user signed in with email/password (requires password verification)
    // vs Google/other providers (don't require password)
    const hasPasswordProvider = user.providerData.some(
      provider => provider.providerId === 'password'
    )
    setRequiresPassword(hasPasswordProvider)
  }, [user])

  const handlePasswordVerification = async () => {
    if (!password.trim()) {
      setError('Ingresa tu contraseña')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await twoFactorService.reauthenticateUser(user, password)

      if (result.success) {
        setStep('phone')
        setSuccess('Autenticación verificada')
      } else {
        setError(result.error || 'Contraseña incorrecta')
      }
    } catch {
      setError('Error verificando contraseña')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleReauth = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await twoFactorService.reauthenticateUser(user)

      if (result.success) {
        setStep('phone')
        setSuccess('Autenticación verificada')
      } else {
        setError(result.error || 'Error en la autenticación')
      }
    } catch {
      setError('Error verificando autenticación')
    } finally {
      setLoading(false)
    }
  }

  const handleStartEnrollment = async () => {
    if (!phoneNumber.trim()) {
      setError('Ingresa un número de teléfono válido')
      trackCustomEvent('2fa_setup_error', 'TwoFactorSetup', 'invalid_phone_number')
      return
    }

    setLoading(true)
    setError('')

    // Track 2FA setup attempt
    trackAuth('2fa_setup_start', 'phone_number')
    trackInteraction('click', '2fa_send_code', { phoneNumber: phoneNumber.slice(-4) }) // Only track last 4 digits for privacy

    try {
      const result = await twoFactorService.startEnrollment(
        user,
        phoneNumber,
        'recaptcha-container',
        requiresPassword ? password : undefined
      )

      if (result.success && result.verificationId) {
        setVerificationId(result.verificationId)
        setStep('verify')
        setSuccess('Código de verificación enviado')
        trackCustomEvent('2fa_code_sent', 'TwoFactorSetup', 'success')
      } else {
        setError(result.error || 'Error enviando código')
        trackCustomEvent('2fa_setup_error', 'TwoFactorSetup', result.error || 'send_code_failed')
      }
    } catch {
      setError('Error iniciando configuración de 2FA')
      trackCustomEvent('2fa_setup_error', 'TwoFactorSetup', 'enrollment_exception')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteEnrollment = async () => {
    if (!verificationCode.trim()) {
      setError('Ingresa el código de verificación')
      trackCustomEvent('2fa_setup_error', 'TwoFactorSetup', 'empty_verification_code')
      return
    }

    setLoading(true)
    setError('')

    // Track verification attempt
    trackInteraction('click', '2fa_verify_code', { codeLength: verificationCode.length })

    try {
      const result = await twoFactorService.completeEnrollment(
        user,
        verificationId,
        verificationCode,
        'Teléfono principal'
      )

      if (result.success) {
        setStep('complete')
        setSuccess('¡2FA configurado exitosamente!')
        await checkTwoFactorStatus()

        // Track successful 2FA setup
        trackAuth('2fa_setup_complete', 'phone_number')
        trackCustomEvent('2fa_enabled', 'TwoFactorSetup', 'success')

        onComplete?.()
      } else {
        setError(result.error || 'Código de verificación incorrecto')
        trackCustomEvent(
          '2fa_setup_error',
          'TwoFactorSetup',
          result.error || 'invalid_verification_code'
        )
      }
    } catch {
      setError('Error completando configuración de 2FA')
      trackCustomEvent('2fa_setup_error', 'TwoFactorSetup', 'completion_exception')
    } finally {
      setLoading(false)
    }
  }

  const handleUnenroll = async (factorUid: string) => {
    setLoading(true)
    setError('')

    // Track 2FA disable attempt
    trackInteraction('click', '2fa_disable', { factorUid })

    try {
      const result = await twoFactorService.unenroll(user, factorUid)

      if (result.success) {
        setSuccess('2FA deshabilitado exitosamente')
        await checkTwoFactorStatus()

        // Track successful 2FA disable
        trackAuth('2fa_disabled', 'user_action')
        trackCustomEvent('2fa_disabled', 'TwoFactorSetup', 'success')
      } else {
        setError(result.error || 'Error deshabilitando 2FA')
        trackCustomEvent('2fa_disable_error', 'TwoFactorSetup', result.error || 'unenroll_failed')
      }
    } catch {
      setError('Error deshabilitando 2FA')
      trackCustomEvent('2fa_disable_error', 'TwoFactorSetup', 'unenroll_exception')
    } finally {
      setLoading(false)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+')) return phone
    if (phone.startsWith('57')) return `+${phone}`
    return `+57${phone}`
  }

  const renderCheckStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='h-5 w-5' />
          Autenticación de Dos Factores (2FA)
        </CardTitle>
        <CardDescription>Añade una capa extra de seguridad a tu cuenta</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {is2FAEnabled ? (
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Badge variant='default' className='bg-green-100 text-green-800'>
                <Check className='h-3 w-3 mr-1' />
                2FA Activado
              </Badge>
            </div>

            <div className='space-y-2'>
              <Label>Métodos configurados:</Label>
              {enrolledFactors.map((factor, index) => (
                <div
                  key={factor.uid}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4' />
                    <span className='text-sm'>{factor.phoneNumber || `Teléfono ${index + 1}`}</span>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleUnenroll(factor.uid)}
                    disabled={loading}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Badge variant='secondary'>
                <X className='h-3 w-3 mr-1' />
                2FA Desactivado
              </Badge>
            </div>

            <div className='text-sm text-muted-foreground'>
              <p>La autenticación de dos factores protege tu cuenta requiriendo:</p>
              <ul className='list-disc list-inside mt-2 space-y-1'>
                <li>Tu contraseña</li>
                <li>Un código enviado a tu teléfono</li>
              </ul>
            </div>

            <Button
              onClick={() => setStep(requiresPassword ? 'password' : 'phone')}
              className='w-full'
            >
              <Shield className='h-4 w-4 mr-2' />
              Configurar 2FA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderPasswordStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Verificar tu identidad</CardTitle>
        <CardDescription>
          {requiresPassword
            ? 'Ingresa tu contraseña para continuar'
            : 'Confirma tu identidad con Google para continuar'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {requiresPassword ? (
          <>
            <div className='space-y-2'>
              <Label htmlFor='password'>Contraseña</Label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder='Ingresa tu contraseña'
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

            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setStep('check')}>
                Cancelar
              </Button>
              <Button onClick={handlePasswordVerification} disabled={loading} className='flex-1'>
                {loading ? 'Verificando...' : 'Continuar'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className='text-sm text-muted-foreground'>
              <p>Haz clic en el botón de abajo para confirmar tu identidad con Google.</p>
            </div>

            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setStep('check')}>
                Cancelar
              </Button>
              <Button onClick={handleGoogleReauth} disabled={loading} className='flex-1'>
                {loading ? 'Autenticando...' : 'Continuar con Google'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )

  const renderPhoneStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Configura tu número de teléfono</CardTitle>
        <CardDescription>
          Ingresa el número donde recibirás los códigos de verificación
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='phone'>Número de teléfono</Label>
          <Input
            id='phone'
            type='tel'
            placeholder='+57 300 123 4567'
            value={phoneNumber}
            onChange={e => setPhoneNumber(formatPhoneNumber(e.target.value))}
            disabled={loading}
          />
          <p className='text-xs text-muted-foreground'>
            Incluye el código de país (ej: +57 para Colombia)
          </p>
        </div>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => setStep(requiresPassword ? 'password' : 'check')}
          >
            Cancelar
          </Button>
          <Button onClick={handleStartEnrollment} disabled={loading} className='flex-1'>
            {loading ? 'Enviando...' : 'Enviar código'}
          </Button>
        </div>

        {/* reCAPTCHA container */}
        <div id='recaptcha-container'></div>
      </CardContent>
    </Card>
  )

  const renderVerifyStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Verifica tu número</CardTitle>
        <CardDescription>Ingresa el código de 6 dígitos enviado a {phoneNumber}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='code'>Código de verificación</Label>
          <Input
            id='code'
            type='text'
            placeholder='123456'
            value={verificationCode}
            onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={loading}
            maxLength={6}
          />
        </div>

        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setStep('phone')}>
            Cambiar número
          </Button>
          <Button onClick={handleCompleteEnrollment} disabled={loading} className='flex-1'>
            {loading ? 'Verificando...' : 'Verificar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderCompleteStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Check className='h-5 w-5 text-green-600' />
          ¡2FA Configurado!
        </CardTitle>
        <CardDescription>
          Tu cuenta ahora está protegida con autenticación de dos factores
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            <strong>Importante:</strong> A partir de ahora necesitarás tu teléfono para iniciar
            sesión. Asegúrate de que siempre tengas acceso a {phoneNumber}.
          </AlertDescription>
        </Alert>

        <Button onClick={() => setStep('check')} className='w-full'>
          Continuar
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className='space-y-4'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className='border-green-200 bg-green-50 text-green-800'>
          <Check className='h-4 w-4' />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {step === 'check' && renderCheckStep()}
      {step === 'password' && renderPasswordStep()}
      {step === 'phone' && renderPhoneStep()}
      {step === 'verify' && renderVerifyStep()}
      {step === 'complete' && renderCompleteStep()}
    </div>
  )
}
