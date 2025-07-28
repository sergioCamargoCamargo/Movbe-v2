'use client'

import { useState, useEffect, useCallback } from 'react'
import { getMultiFactorResolver } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { Shield, Phone, AlertCircle } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { twoFactorService } from '@/lib/services/TwoFactorService'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { TwoFactorVerificationProps } from '@/lib/types/components/TwoFactorTypes'

export default function TwoFactorVerification({
  error,
  onSuccess,
  onCancel,
}: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [loading, setLoading] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [selectedFactorIndex] = useState(0) // Por defecto usar el primer factor
  const { trackAuth, trackInteraction, trackCustomEvent } = useAnalytics()

  useEffect(() => {
    // Automatically send code when component mounts
    sendVerificationCode()

    // Cleanup on unmount
    return () => {
      twoFactorService.cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendVerificationCode = useCallback(async () => {
    setLoading(true)
    setVerificationError('')

    // Track code send attempt
    trackInteraction('click', '2fa_verify_send_code', { attempt: true })

    try {
      const result = await twoFactorService.send2FACode(
        error,
        'recaptcha-container-2fa',
        selectedFactorIndex
      )

      if (result.success && result.verificationId) {
        setVerificationId(result.verificationId)
        setCodeSent(true)
        // Track successful code send
        trackCustomEvent('2fa_verify_code_sent', 'TwoFactorVerification', 'success')
      } else {
        setVerificationError(result.error || 'Error enviando código de verificación')
        // Track failed code send
        trackCustomEvent(
          '2fa_verify_send_error',
          'TwoFactorVerification',
          result.error || 'send_failed'
        )
      }
    } catch {
      setVerificationError('Error enviando código de verificación')
      trackCustomEvent('2fa_verify_send_error', 'TwoFactorVerification', 'exception')
    } finally {
      setLoading(false)
    }
  }, [error, selectedFactorIndex, trackInteraction, trackCustomEvent])

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setVerificationError('Ingresa el código de verificación')
      trackCustomEvent('2fa_verify_error', 'TwoFactorVerification', 'empty_code')
      return
    }

    if (verificationCode.length < 6) {
      setVerificationError('El código debe tener 6 dígitos')
      trackCustomEvent('2fa_verify_error', 'TwoFactorVerification', 'invalid_code_length')
      return
    }

    setLoading(true)
    setVerificationError('')

    // Track verification attempt
    trackInteraction('click', '2fa_verify_attempt', { codeLength: verificationCode.length })

    try {
      const result = await twoFactorService.verify2FA(
        error,
        verificationId,
        verificationCode,
        selectedFactorIndex
      )

      if (result.success) {
        // Track successful verification
        trackAuth('2fa_verification_success', 'login')
        trackCustomEvent('2fa_verification_success', 'TwoFactorVerification', 'success')
        onSuccess()
      } else {
        setVerificationError(result.error || 'Código de verificación incorrecto')
        // Track failed verification
        trackCustomEvent(
          '2fa_verify_error',
          'TwoFactorVerification',
          result.error || 'invalid_code'
        )
      }
    } catch {
      setVerificationError('Error verificando código')
      trackCustomEvent('2fa_verify_error', 'TwoFactorVerification', 'verification_exception')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerification()
    }
  }

  const getPhoneNumber = () => {
    try {
      const resolver = getMultiFactorResolver(auth, error)
      const hints = resolver.hints
      if (hints && hints.length > 0) {
        const phoneHint = hints[selectedFactorIndex] as { phoneNumber?: string }
        const phoneNumber = phoneHint.phoneNumber || 'tu número registrado'
        // Mask phone number for security
        if (phoneNumber.length > 4) {
          const masked = phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4)
          return masked
        }
        return phoneNumber
      }
    } catch {
      // Fallback if error getting phone number
    }
    return 'tu número registrado'
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='text-center'>
        <CardTitle className='flex items-center justify-center gap-2'>
          <Shield className='h-5 w-5' />
          Verificación de Dos Factores
        </CardTitle>
        <CardDescription>Se requiere verificación adicional para continuar</CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        {verificationError && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{verificationError}</AlertDescription>
          </Alert>
        )}

        <div className='text-center space-y-2'>
          <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
            <Phone className='h-4 w-4' />
            <span>Código enviado a {getPhoneNumber()}</span>
          </div>

          {!codeSent && loading && (
            <p className='text-sm text-muted-foreground'>Enviando código de verificación...</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='verification-code'>Código de verificación</Label>
          <Input
            id='verification-code'
            type='text'
            placeholder='123456'
            value={verificationCode}
            onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyPress={handleKeyPress}
            disabled={loading || !codeSent}
            maxLength={6}
            className='text-center text-lg tracking-widest'
          />
          <p className='text-xs text-muted-foreground text-center'>
            Ingresa el código de 6 dígitos recibido por SMS
          </p>
        </div>

        <div className='space-y-3'>
          <Button
            onClick={handleVerification}
            disabled={loading || !codeSent || verificationCode.length < 6}
            className='w-full'
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </Button>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                // Track code resend attempt
                trackInteraction('click', '2fa_verify_resend_code', { action: 'resend' })
                sendVerificationCode()
              }}
              disabled={loading}
              className='flex-1'
            >
              {loading ? 'Enviando...' : 'Reenviar código'}
            </Button>

            <Button
              variant='ghost'
              onClick={() => {
                // Track verification cancellation
                trackAuth('2fa_verification_cancelled', 'user_action')
                trackInteraction('click', '2fa_verify_cancel', { action: 'cancel' })
                onCancel()
              }}
              disabled={loading}
              className='flex-1'
            >
              Cancelar
            </Button>
          </div>
        </div>

        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription className='text-xs'>
            Si no recibes el código, verifica que tu teléfono tenga señal y que el número registrado
            sea correcto. El código puede tardar hasta 2 minutos en llegar.
          </AlertDescription>
        </Alert>

        {/* reCAPTCHA container for 2FA verification */}
        <div id='recaptcha-container-2fa' className='hidden'></div>
      </CardContent>
    </Card>
  )
}
