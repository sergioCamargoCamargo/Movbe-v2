'use client'

import { User, Mail, Shield, Bell, Camera, Settings, Lock, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import Header from '@/app/components/Header'
import Sidebar from '@/app/components/Sidebar'
import { PageTransition } from '@/components/PageTransition'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { getUserService } from '@/lib/di/serviceRegistration'
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import {
  setUserSettings,
  setLoading,
  setSaving,
  setError,
  setIsGoogleUser,
  setDisplayName,
  setEmailNotifications,
  setPushNotifications,
  setTwoFactorEnabled,
  setPasswordDialog,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
} from '@/lib/store/slices/settingsSlice'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'
import { handleError, getErrorMessage } from '@/lib/utils/errorHandler'
import { UserSettings } from '@/types'

export default function SettingsPage() {
  const { user } = useAppSelector(state => state.auth)
  const {
    userSettings,
    loading,
    saving,
    displayName,
    emailNotifications,
    pushNotifications,
    twoFactorEnabled,
    passwordDialog,
    currentPassword,
    newPassword,
    confirmPassword,
    isGoogleUser,
  } = useAppSelector(state => state.settings)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const userService = getUserService()

  useEffect(() => {
    loadUserData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async () => {
    try {
      const currentUser = await userService.getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      dispatch(setDisplayName(currentUser.displayName ?? ''))

      // Check if user signed in with Google
      const isGoogleAuth =
        (currentUser as any).providerData?.some(
          (provider: any) => provider.providerId === 'google.com'
        ) ?? false
      dispatch(setIsGoogleUser(isGoogleAuth))

      const settings = await userService.getUserSettings(currentUser.id)
      dispatch(setUserSettings(settings))
    } catch {
      dispatch(setError('No se pudo cargar la información del usuario'))
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del usuario',
        variant: 'destructive',
        variant: 'destructive',
      })
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    dispatch(setSaving(true))
    try {
      await userService.updateUser(user.uid, {
        displayName: displayName.trim() || user.displayName || undefined,
        displayName: displayName.trim() || user.displayName || undefined,
      })

      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios se han guardado correctamente',
        description: 'Los cambios se han guardado correctamente',
      })
    } catch (error) {
      const appError = handleError(error)
      dispatch(setError(getErrorMessage(appError)))
      toast({
        title: 'Error',
        description: getErrorMessage(appError),
        variant: 'destructive',
        variant: 'destructive',
      })
    } finally {
      dispatch(setSaving(false))
    }
  }

  const handleChangePassword = async () => {
    if (!user || !newPassword) return

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres.',
        variant: 'destructive',
      })
      return
    }

    dispatch(setSaving(true))
    try {
      const success = await userService.changePassword(user.uid, currentPassword, newPassword)


      if (success) {
        toast({
          title: 'Contraseña actualizada',
          description: 'Tu contraseña se ha cambiado correctamente.',
        })

        dispatch(setPasswordDialog(false))
      } else {
        throw new Error('Error al cambiar la contraseña')
      }
    } catch (error) {
      const appError = handleError(error)
      dispatch(setError(getErrorMessage(appError)))
      toast({
        title: 'Error',
        description: getErrorMessage(appError),
        variant: 'destructive',
        variant: 'destructive',
      })
    } finally {
      dispatch(setSaving(false))
    }
  }

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return

    try {
      const updatedSettings = await userService.updateUserSettings(user.uid, newSettings)
      dispatch(setUserSettings(updatedSettings))

      toast({
        title: 'Configuración actualizada',
        description: 'Los cambios se han aplicado correctamente',
      })
    } catch (error) {
      const appError = handleError(error)
      dispatch(setError(getErrorMessage(appError)))
      toast({
        title: 'Error',
        description: getErrorMessage(appError),
        variant: 'destructive',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className='flex flex-col h-screen'>
        <Header onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <div className='flex-1 overflow-auto bg-background p-4'>
            <div className='max-w-4xl mx-auto'>
              <div className='animate-pulse'>
                <div className='h-8 bg-muted rounded mb-4' />
                <div className='space-y-4'>
                  <div className='h-32 bg-muted rounded' />
                  <div className='h-48 bg-muted rounded' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <PageTransition>
      <div className='flex flex-col h-screen'>
        <Header onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <div className='flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/30 p-2 sm:p-4 md:p-6 lg:p-8'>
            <div className='max-w-4xl mx-auto'>
              <div className='mb-6 sm:mb-8'>
                <div className='text-center sm:text-left'>
                  <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
                    Configuración de cuenta
                  </h1>
                  <p className='text-muted-foreground text-sm sm:text-base md:text-lg mt-2'>
                    Personaliza tu experiencia y administra tu perfil
                  </p>
                </div>
              </div>

              <div className='space-y-4 sm:space-y-6 md:space-y-8'>
                {/* Profile Section */}
                <Card className='border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur-sm'>
                  <CardHeader className='pb-4 sm:pb-6 px-4 sm:px-6'>
                    <CardTitle className='flex items-center gap-2 sm:gap-3 text-lg sm:text-xl'>
                      <div className='p-1.5 sm:p-2 bg-primary/10 rounded-lg'>
                        <User className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
                      </div>
                      Información del perfil
                    </CardTitle>
                    <CardDescription className='text-sm sm:text-base'>
                      Actualiza tu información personal y foto de perfil
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4 sm:space-y-6 md:space-y-8 px-4 sm:px-6'>
                    <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-muted/20 rounded-xl'>
                      <div className='relative group'>
                        <Avatar className='h-20 w-20 sm:h-24 sm:w-24 ring-2 sm:ring-4 ring-primary/20 transition-all group-hover:ring-primary/40'>
                          <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                          <AvatarFallback className='text-xl bg-gradient-to-br from-primary/20 to-primary/10'>
                            {user.displayName ? (
                              user.displayName.charAt(0).toUpperCase()
                            ) : user.email ? (
                              user.email.charAt(0).toUpperCase()
                            ) : (
                              <User className='h-10 w-10' />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className='absolute -bottom-2 -right-2 p-2 bg-primary rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors'>
                          <Camera className='h-4 w-4 text-primary-foreground' />
                        </div>
                      </div>
                      <div className='text-center sm:text-left space-y-2'>
                        <h3 className='text-base sm:text-lg font-semibold'>
                          {user.displayName || 'Usuario'}
                        </h3>
                        <p className='text-xs sm:text-sm text-muted-foreground break-words'>
                          {user.email}
                        </p>
                        <Button variant='outline' size='sm' className='mt-3 text-xs sm:text-sm'>
                          <Camera className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
                          Cambiar foto
                        </Button>
                        <p className='text-xs text-muted-foreground mt-1'>
                          JPG, PNG o GIF. Máximo 2MB.
                        </p>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
                      <div className='space-y-3'>
                        <Label htmlFor='displayName' className='text-sm font-medium'>
                          Nombre de usuario
                        </Label>
                        <Input
                          id='displayName'
                          value={displayName}
                          onChange={e => dispatch(setDisplayName(e.target.value))}
                          placeholder='Tu nombre de usuario'
                          className='h-12 focus:ring-2 focus:ring-primary/20'
                        />
                      </div>
                      <div className='space-y-3'>
                        <Label htmlFor='email' className='text-sm font-medium'>
                          Correo electrónico
                        </Label>
                        <div className='relative'>
                          <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                          <Input
                            id='email'
                            type='email'
                            defaultValue={user.email || ''}
                            disabled
                            className='h-12 pl-10 bg-muted/50'
                          />
                        </div>
                      </div>
                    </div>

                    <div className='flex justify-center sm:justify-end'>
                      <Button
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className='w-full sm:w-auto px-6 sm:px-8 h-10 sm:h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-sm sm:text-base'
                      >
                        <Settings className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Section */}
                <Card className='border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur-sm'>
                  <CardHeader className='pb-6'>
                    <CardTitle className='flex items-center gap-3 text-xl'>
                      <div className='p-2 bg-green-500/10 rounded-lg'>
                        <Shield className='h-5 w-5 text-green-600' />
                      </div>
                      Seguridad
                    </CardTitle>
                    <CardDescription className='text-base'>
                      Administra la seguridad de tu cuenta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    {/* Password Change - Only for non-Google users */}
                    {!isGoogleUser && (
                      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-800/30'>
                        <div className='flex items-start gap-3'>
                          <div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-lg'>
                            <Lock className='h-4 w-4 text-green-600' />
                          </div>
                          <div>
                            <h4 className='font-semibold text-green-900 dark:text-green-100'>
                              Cambiar contraseña
                            </h4>
                            <p className='text-sm text-green-700 dark:text-green-300 mt-1'>
                              Actualiza tu contraseña regularmente para mantener tu cuenta segura
                            </p>
                          </div>
                        </div>
                        <Dialog
                          open={passwordDialog}
                          onOpenChange={open => dispatch(setPasswordDialog(open))}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant='outline'
                              className='border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20'
                            >
                              <Lock className='h-4 w-4 mr-2' />
                              Cambiar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Cambiar contraseña</DialogTitle>
                              <DialogDescription>
                                Ingresa tu contraseña actual y la nueva contraseña.
                              </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4'>
                              <div>
                                <Label htmlFor='current-password'>Contraseña actual</Label>
                                <Input
                                  id='current-password'
                                  type='password'
                                  value={currentPassword}
                                  onChange={e => dispatch(setCurrentPassword(e.target.value))}
                                  placeholder='Ingresa tu contraseña actual'
                                />
                              </div>
                              <div>
                                <Label htmlFor='new-password'>Nueva contraseña</Label>
                                <Input
                                  id='new-password'
                                  type='password'
                                  value={newPassword}
                                  onChange={e => dispatch(setNewPassword(e.target.value))}
                                  placeholder='Ingresa tu nueva contraseña'
                                />
                              </div>
                              <div>
                                <Label htmlFor='confirm-password'>Confirmar nueva contraseña</Label>
                                <Input
                                  id='confirm-password'
                                  type='password'
                                  value={confirmPassword}
                                  onChange={e => dispatch(setConfirmPassword(e.target.value))}
                                  placeholder='Confirma tu nueva contraseña'
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant='outline'
                                onClick={() => dispatch(setPasswordDialog(false))}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleChangePassword}
                                disabled={
                                  saving || !currentPassword || !newPassword || !confirmPassword
                                }
                              >
                                {saving ? 'Cambiando...' : 'Cambiar contraseña'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}

                    {/* Google User Info */}
                    {isGoogleUser && (
                      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30'>
                        <div className='flex items-start gap-3'>
                          <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                            <Shield className='h-4 w-4 text-blue-600' />
                          </div>
                          <div>
                            <h4 className='font-semibold text-blue-900 dark:text-blue-100'>
                              Cuenta de Google
                            </h4>
                            <p className='text-sm text-blue-700 dark:text-blue-300 mt-1'>
                              Tu cuenta está vinculada con Google. La contraseña se gestiona desde
                              tu cuenta de Google.
                            </p>
                          </div>
                        </div>
                        <Button
                          variant='outline'
                          className='border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20'
                          disabled
                        >
                          <Shield className='h-4 w-4 mr-2' />
                          Gestionado por Google
                        </Button>
                      </div>
                    )}

                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30'>
                      <div className='flex items-start gap-3'>
                        <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                          <Shield className='h-4 w-4 text-blue-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-blue-900 dark:text-blue-100'>
                            Verificación en dos pasos
                          </h4>
                          <p className='text-sm text-blue-700 dark:text-blue-300 mt-1'>
                            Añade una capa extra de seguridad a tu cuenta
                          </p>
                          <div className='flex items-center gap-2 mt-2'>
                            <Switch
                              checked={twoFactorEnabled}
                              onCheckedChange={checked => {
                                dispatch(setTwoFactorEnabled(checked))
                                handleUpdateSettings({
                                  privacy: {
                                    showEmail: userSettings?.privacy?.showEmail ?? false,
                                    showActivity: userSettings?.privacy?.showActivity ?? true,
                                    profileVisibility: checked ? 'private' : 'public',
                                  },
                                    profileVisibility: checked ? 'private' : 'public',
                                  },
                                })
                              }}
                            />
                            <span className='text-xs text-blue-600 dark:text-blue-400'>
                              {twoFactorEnabled ? 'Activado' : 'Desactivado'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant='outline'
                        className='border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20'
                      >
                        <Shield className='h-4 w-4 mr-2' />
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications Section */}
                <Card className='border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur-sm'>
                  <CardHeader className='pb-6'>
                    <CardTitle className='flex items-center gap-3 text-xl'>
                      <div className='p-2 bg-yellow-500/10 rounded-lg'>
                        <Bell className='h-5 w-5 text-yellow-600' />
                      </div>
                      Notificaciones
                    </CardTitle>
                    <CardDescription className='text-base'>
                      Personaliza cómo y cuándo recibes notificaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div className='flex items-center justify-between p-4 bg-yellow-50/50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200/50 dark:border-yellow-800/30'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg'>
                          <Mail className='h-4 w-4 text-yellow-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-yellow-900 dark:text-yellow-100'>
                            Notificaciones por email
                          </h4>
                          <p className='text-sm text-yellow-700 dark:text-yellow-300'>
                            Recibe actualizaciones importantes por correo electrónico
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={checked => {
                          dispatch(setEmailNotifications(checked))
                          handleUpdateSettings({
                            notifications: {
                              email: checked,
                              push: userSettings?.notifications?.push ?? true,
                              newVideos: userSettings?.notifications?.newVideos ?? true,
                              comments: userSettings?.notifications?.comments ?? true,
                              likes: userSettings?.notifications?.likes ?? true,
                              followers: userSettings?.notifications?.followers ?? true,
                            },
                              followers: userSettings?.notifications?.followers ?? true,
                            },
                          })
                        }}
                      />
                    </div>

                    <div className='flex items-center justify-between p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200/50 dark:border-purple-800/30'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg'>
                          <Bell className='h-4 w-4 text-purple-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-purple-900 dark:text-purple-100'>
                            Notificaciones push
                          </h4>
                          <p className='text-sm text-purple-700 dark:text-purple-300'>
                            Recibe notificaciones en tiempo real en tu dispositivo
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={pushNotifications}
                        onCheckedChange={checked => {
                          dispatch(setPushNotifications(checked))
                          handleUpdateSettings({
                            notifications: {
                              email: userSettings?.notifications?.email ?? true,
                              push: checked,
                              newVideos: userSettings?.notifications?.newVideos ?? true,
                              comments: userSettings?.notifications?.comments ?? true,
                              likes: userSettings?.notifications?.likes ?? true,
                              followers: userSettings?.notifications?.followers ?? true,
                            },
                              followers: userSettings?.notifications?.followers ?? true,
                            },
                          })
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Account Management */}
                <Card className='border-0 shadow-lg bg-gradient-to-r from-red-50/50 to-red-100/30 dark:from-red-950/30 dark:to-red-900/20 backdrop-blur-sm border-red-200/50 dark:border-red-800/50'>
                  <CardHeader className='pb-6'>
                    <CardTitle className='flex items-center gap-3 text-xl text-red-600 dark:text-red-400'>
                      <div className='p-2 bg-red-100 dark:bg-red-900/30 rounded-lg'>
                        <Trash2 className='h-5 w-5 text-red-600 dark:text-red-400' />
                      </div>
                      Zona de peligro
                    </CardTitle>
                    <CardDescription className='text-base text-red-700 dark:text-red-300'>
                      Acciones irreversibles relacionadas con tu cuenta
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-100/50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800'>
                      <div className='flex items-start gap-3'>
                        <div className='p-2 bg-red-200 dark:bg-red-900/50 rounded-lg'>
                          <Trash2 className='h-4 w-4 text-red-600 dark:text-red-400' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-red-800 dark:text-red-200'>
                            Eliminar cuenta
                          </h4>
                          <p className='text-sm text-red-700 dark:text-red-300 mt-1'>
                            Eliminar permanentemente tu cuenta y todos los datos asociados
                          </p>
                          <p className='text-xs text-red-600 dark:text-red-400 mt-2 font-medium'>
                            ⚠️ Esta acción no se puede deshacer
                          </p>
                        </div>
                      </div>
                      <Button
                        variant='destructive'
                        className='bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                      >
                        <Trash2 className='h-4 w-4 mr-2' />
                        Eliminar cuenta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
