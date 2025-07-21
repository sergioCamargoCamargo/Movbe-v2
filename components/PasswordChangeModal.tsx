'use client'

import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>
  loading?: boolean
}

export default function PasswordChangeModal({
  isOpen,
  onClose,
  onPasswordChange,
  loading = false,
}: PasswordChangeModalProps) {
  const { t } = useTranslation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  const validatePassword = (password: string): string[] => {
    const errors = []
    if (password.length < 8) {
      errors.push(t('auth.passwordMinLength'))
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push(t('auth.passwordLowercase'))
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push(t('auth.passwordUppercase'))
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push(t('auth.passwordNumber'))
    }
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: typeof errors = {}

    // Validar contraseña actual
    if (!currentPassword) {
      newErrors.currentPassword = t('settings.currentPasswordRequired')
    }

    // Validar nueva contraseña
    if (!newPassword) {
      newErrors.newPassword = t('settings.newPasswordRequired')
    } else {
      const passwordErrors = validatePassword(newPassword)
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors[0]
      }
    }

    // Validar confirmación
    if (!confirmPassword) {
      newErrors.confirmPassword = t('settings.confirmPasswordRequired')
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch')
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = t('settings.newPasswordSameAsCurrent')
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        await onPasswordChange(currentPassword, newPassword)
        handleClose()
      } catch {
        // Los errores se manejan en el componente padre
      }
    }
  }

  const handleClose = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setErrors({})
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Lock className='h-5 w-5' />
            {t('settings.changePassword')}
          </DialogTitle>
          <DialogDescription>{t('settings.changePasswordModalDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Contraseña actual */}
          <div className='space-y-2'>
            <Label htmlFor='currentPassword'>{t('settings.currentPassword')}</Label>
            <div className='relative'>
              <Input
                id='currentPassword'
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder={t('settings.currentPasswordPlaceholder')}
                className={errors.currentPassword ? 'border-destructive' : ''}
                disabled={loading}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={loading}
              >
                {showCurrentPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className='text-sm text-destructive'>{errors.currentPassword}</p>
            )}
          </div>

          {/* Nueva contraseña */}
          <div className='space-y-2'>
            <Label htmlFor='newPassword'>{t('settings.newPassword')}</Label>
            <div className='relative'>
              <Input
                id='newPassword'
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder={t('settings.newPasswordPlaceholder')}
                className={errors.newPassword ? 'border-destructive' : ''}
                disabled={loading}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={loading}
              >
                {showNewPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </Button>
            </div>
            {errors.newPassword && <p className='text-sm text-destructive'>{errors.newPassword}</p>}
          </div>

          {/* Confirmar contraseña */}
          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>{t('settings.confirmNewPassword')}</Label>
            <div className='relative'>
              <Input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t('settings.confirmPasswordPlaceholder')}
                className={errors.confirmPassword ? 'border-destructive' : ''}
                disabled={loading}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className='text-sm text-destructive'>{errors.confirmPassword}</p>
            )}
          </div>

          {/* Indicador de fortaleza de contraseña */}
          {newPassword && (
            <div className='space-y-2'>
              <Label className='text-sm text-muted-foreground'>
                {t('settings.passwordStrength')}
              </Label>
              <div className='space-y-1'>
                {validatePassword(newPassword).map((error, index) => (
                  <p key={index} className='text-xs text-destructive'>
                    • {error}
                  </p>
                ))}
                {validatePassword(newPassword).length === 0 && (
                  <p className='text-xs text-green-600 dark:text-green-400'>
                    ✓ {t('settings.passwordStrengthGood')}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button type='button' variant='outline' onClick={handleClose} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? t('settings.changingPassword') : t('settings.changePassword')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
