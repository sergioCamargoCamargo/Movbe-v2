'use client'

import { Bell, Camera, Edit, Lock, Save, Shield, Trash2, User, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import HeaderDynamic from '@/app/components/HeaderDynamic'
import Sidebar from '@/app/components/Sidebar'
import { PageTransition } from '@/components/PageTransition'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { getUserService } from '@/lib/di/serviceRegistration'
import { avatarService } from '@/lib/services/AvatarService'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const userService = getUserService()

  // Estados locales
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [newVideosNotifications, setNewVideosNotifications] = useState(true)
  const [commentsNotifications, setCommentsNotifications] = useState(true)
  const [likesNotifications, setLikesNotifications] = useState(true)
  const [followersNotifications, setFollowersNotifications] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isGoogleUser, setIsGoogleUser] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [hasProfileChanges, setHasProfileChanges] = useState(false)
  const [originalNotifications, setOriginalNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    newVideos: true,
    comments: true,
    likes: true,
    followers: true,
  })
  const [originalDisplayName, setOriginalDisplayName] = useState('')

  const loadUserData = useCallback(async () => {
    try {
      if (!user) return

      const currentDisplayName = user.displayName || ''
      setDisplayName(currentDisplayName)
      setOriginalDisplayName(currentDisplayName)

      // Verificar si es usuario de Google
      const isGoogle =
        (user as { providerData?: { providerId: string }[] }).providerData?.some(
          (provider: { providerId: string }) => provider.providerId === 'google.com'
        ) ?? false
      setIsGoogleUser(isGoogle)

      // Cargar configuraciones del usuario
      try {
        const settings = await userService.getUserSettings(user.uid)
        const notifications = {
          email: settings?.notifications?.email ?? true,
          push: settings?.notifications?.push ?? true,
          marketing: settings?.notifications?.marketing ?? false,
          newVideos: settings?.notifications?.newVideos ?? true,
          comments: settings?.notifications?.comments ?? true,
          likes: settings?.notifications?.likes ?? true,
          followers: settings?.notifications?.followers ?? true,
        }

        setEmailNotifications(notifications.email)
        setPushNotifications(notifications.push)
        setMarketingEmails(notifications.marketing)
        setNewVideosNotifications(notifications.newVideos)
        setCommentsNotifications(notifications.comments)
        setLikesNotifications(notifications.likes)
        setFollowersNotifications(notifications.followers)
        setOriginalNotifications(notifications)
        setTwoFactorEnabled(settings?.security?.twoFactor ?? false)
      } catch {
        // Error loading settings - will use defaults
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del usuario',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [user, userService, toast])

  useEffect(() => {
    // Don't redirect if auth is still loading
    if (authLoading) return

    if (!user) {
      router.push('/auth/login')
      return
    }
    loadUserData()
  }, [user, authLoading, router, loadUserData])

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    try {
      setSaving(true)

      const result = await avatarService.uploadAvatar(user.uid, file, dispatch)

      if (result.success) {
        toast({
          title: 'Avatar actualizado',
          description: result.message || 'Tu foto de perfil ha sido actualizada correctamente',
        })
      } else {
        toast({
          title: 'Error',
          description: result.message || 'No se pudo actualizar tu foto de perfil',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'No se pudo actualizar tu foto de perfil',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAll = async () => {
    if (!user) return

    setSaving(true)
    try {
      // Save profile changes if any
      if (hasProfileChanges) {
        await userService.updateUser(user.uid, {
          displayName: displayName.trim() || user.displayName || undefined,
        })
        setOriginalDisplayName(displayName.trim() || user.displayName || '')
        setHasProfileChanges(false)
        setIsEditing(false)
      }

      // Save notification changes if any
      if (hasUnsavedChanges) {
        const settings = {
          notifications: {
            email: emailNotifications,
            push: pushNotifications,
            marketing: marketingEmails,
            newVideos: newVideosNotifications,
            comments: commentsNotifications,
            likes: likesNotifications,
            followers: followersNotifications,
          },
        }

        await userService.updateUserSettings(user.uid, settings)
        setOriginalNotifications(settings.notifications)
        setHasUnsavedChanges(false)
      }

      toast({
        title: 'Cambios guardados',
        description: 'Todos los cambios se han guardado correctamente',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value)
    setHasProfileChanges(value.trim() !== originalDisplayName)
  }

  const handleNotificationChange = (type: string, value: boolean) => {
    if (type === 'email') setEmailNotifications(value)
    if (type === 'push') setPushNotifications(value)
    if (type === 'marketing') setMarketingEmails(value)
    if (type === 'newVideos') setNewVideosNotifications(value)
    if (type === 'comments') setCommentsNotifications(value)
    if (type === 'likes') setLikesNotifications(value)
    if (type === 'followers') setFollowersNotifications(value)

    setHasUnsavedChanges(true)
  }

  const handleCancelChanges = () => {
    // Reset profile changes
    setDisplayName(originalDisplayName)
    setHasProfileChanges(false)
    setIsEditing(false)

    // Reset notification changes
    setEmailNotifications(originalNotifications.email)
    setPushNotifications(originalNotifications.push)
    setMarketingEmails(originalNotifications.marketing)
    setNewVideosNotifications(originalNotifications.newVideos)
    setCommentsNotifications(originalNotifications.comments)
    setLikesNotifications(originalNotifications.likes)
    setFollowersNotifications(originalNotifications.followers)
    setHasUnsavedChanges(false)
  }

  const hasAnyChanges = hasUnsavedChanges || hasProfileChanges

  const handleDeleteAccount = async () => {
    if (!user) return

    try {
      // Aquí implementarías la lógica de eliminación de cuenta
      toast({
        title: 'Cuenta eliminada',
        description: 'Tu cuenta ha sido eliminada permanentemente',
      })
      router.push('/')
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la cuenta',
        variant: 'destructive',
      })
    }
  }

  if (loading || authLoading) {
    return (
      <div className='flex flex-col h-screen'>
        <HeaderDynamic onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <div className='flex-1 overflow-auto bg-background p-6'>
            <div className='max-w-4xl mx-auto'>
              <div className='animate-pulse space-y-6'>
                <div className='h-8 bg-muted rounded w-1/3' />
                <div className='h-32 bg-muted rounded' />
                <div className='h-48 bg-muted rounded' />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <PageTransition>
      <div className='flex flex-col h-screen'>
        <HeaderDynamic onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <div className='flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/20 p-6 md:h-auto mobile-scroll-container ios-scroll-fix'>
            <div className='max-w-4xl mx-auto space-y-8'>
              {/* Header */}
              <div className='space-y-2'>
                <h1 className='text-3xl font-bold tracking-tight'>Configuración</h1>
                <p className='text-muted-foreground'>
                  Administra tu cuenta y preferencias de la aplicación
                </p>
              </div>

              {/* Perfil */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    Perfil
                  </CardTitle>
                  <CardDescription>Información básica de tu cuenta</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Avatar y nombre */}
                  <div className='flex items-start gap-4'>
                    <div className='relative'>
                      <Avatar className='h-20 w-20'>
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                        <AvatarFallback className='text-lg'>
                          {user.displayName
                            ? user.displayName.charAt(0).toUpperCase()
                            : user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Botón invisible que activa el input file */}
                      <input
                        type='file'
                        accept='image/*'
                        className='hidden'
                        id='avatar-upload'
                        onChange={handleAvatarChange} // Este método ya lo tienes
                      />

                      <label
                        htmlFor='avatar-upload'
                        className='absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white shadow cursor-pointer flex items-center justify-center'
                        aria-label='Cambiar avatar'
                      >
                        <Camera className='h-4 w-4 text-muted-foreground' />
                      </label>
                    </div>

                    <div className='flex-1 space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='displayName'>Nombre de usuario</Label>
                        <div className='flex gap-2'>
                          <Input
                            id='displayName'
                            value={displayName}
                            onChange={e => handleDisplayNameChange(e.target.value)}
                            disabled={!isEditing}
                            placeholder='Tu nombre de usuario'
                          />
                          {!isEditing ? (
                            <Button variant='outline' size='sm' onClick={() => setIsEditing(true)}>
                              <Edit className='h-4 w-4' />
                            </Button>
                          ) : (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                setIsEditing(false)
                                setDisplayName(originalDisplayName)
                                setHasProfileChanges(false)
                              }}
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label>Email</Label>
                        <div className='flex items-center gap-2'>
                          <Input value={user.email || ''} disabled className='bg-muted' />
                          {isGoogleUser && <Badge variant='secondary'>Google</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seguridad */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Shield className='h-5 w-5' />
                    Seguridad
                  </CardTitle>
                  <CardDescription>Configuraciones de seguridad de tu cuenta</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {!isGoogleUser && (
                    <>
                      <div className='flex items-center justify-between'>
                        <div className='space-y-1'>
                          <Label>Cambiar contraseña</Label>
                          <p className='text-sm text-muted-foreground'>
                            Actualiza tu contraseña regularmente
                          </p>
                        </div>
                        <Button variant='outline'>
                          <Lock className='h-4 w-4 mr-2' />
                          Cambiar
                        </Button>
                      </div>
                      <Separator />
                    </>
                  )}

                  <div
                    className='flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer md:p-3 md:border-0 md:rounded-none md:hover:bg-transparent'
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  >
                    <div className='space-y-1 flex-1 mr-4'>
                      <Label className='text-base md:text-sm cursor-pointer'>
                        Autenticación de dos factores
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Añade una capa extra de seguridad
                      </p>
                    </div>
                    <div className='flex-shrink-0'>
                      {/* Mobile: Checkbox */}
                      <Checkbox
                        checked={twoFactorEnabled}
                        onCheckedChange={checked => setTwoFactorEnabled(checked === true)}
                        className='h-4 w-4 rounded-md md:hidden'
                      />
                      {/* Desktop: Switch */}
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={checked => setTwoFactorEnabled(checked === true)}
                        className='hidden md:flex'
                      />
                    </div>
                  </div>

                  {isGoogleUser && (
                    <div className='p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                      <div className='flex items-center gap-3'>
                        <Shield className='h-5 w-5 text-blue-600' />
                        <div>
                          <p className='font-medium text-blue-900 dark:text-blue-100'>
                            Cuenta vinculada con Google
                          </p>
                          <p className='text-sm text-blue-700 dark:text-blue-300'>
                            Tu contraseña se gestiona desde tu cuenta de Google
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notificaciones */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Bell className='h-5 w-5' />
                    Notificaciones
                  </CardTitle>
                  <CardDescription>Personaliza qué notificaciones quieres recibir</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Notification Item */}
                  <div
                    className='flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer md:p-3 md:border-0 md:rounded-none md:hover:bg-transparent'
                    onClick={() => handleNotificationChange('email', !emailNotifications)}
                  >
                    <div className='space-y-1 flex-1 mr-4'>
                      <Label className='text-base md:text-sm cursor-pointer'>
                        Notificaciones por email
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Recibe actualizaciones importantes por correo
                      </p>
                    </div>
                    <div className='flex-shrink-0'>
                      {/* Mobile: Checkbox */}
                      <Checkbox
                        checked={emailNotifications}
                        onCheckedChange={checked =>
                          handleNotificationChange('email', checked === true)
                        }
                        className='h-4 w-4 rounded-md md:hidden'
                      />
                      {/* Desktop: Switch */}
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={checked =>
                          handleNotificationChange('email', checked === true)
                        }
                        className='hidden md:flex'
                      />
                    </div>
                  </div>

                  <Separator className='md:block hidden' />

                  {/* Notification Item */}
                  <div
                    className='flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer md:p-3 md:border-0 md:rounded-none md:hover:bg-transparent'
                    onClick={() => handleNotificationChange('push', !pushNotifications)}
                  >
                    <div className='space-y-1 flex-1 mr-4'>
                      <Label className='text-base md:text-sm cursor-pointer'>
                        Notificaciones push
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones en tiempo real en tu dispositivo
                      </p>
                    </div>
                    <div className='flex-shrink-0'>
                      {/* Mobile: Checkbox */}
                      <Checkbox
                        checked={pushNotifications}
                        onCheckedChange={checked =>
                          handleNotificationChange('push', checked === true)
                        }
                        className='h-4 w-4 rounded-md md:hidden'
                      />
                      {/* Desktop: Switch */}
                      <Switch
                        checked={pushNotifications}
                        onCheckedChange={checked =>
                          handleNotificationChange('push', checked === true)
                        }
                        className='hidden md:flex'
                      />
                    </div>
                  </div>

                  <Separator className='md:block hidden' />

                  {/* Notification Item */}
                  <div
                    className='flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer md:p-3 md:border-0 md:rounded-none md:hover:bg-transparent'
                    onClick={() => handleNotificationChange('marketing', !marketingEmails)}
                  >
                    <div className='space-y-1 flex-1 mr-4'>
                      <Label className='text-base md:text-sm cursor-pointer'>
                        Emails de marketing
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Ofertas especiales y noticias del producto
                      </p>
                    </div>
                    <div className='flex-shrink-0'>
                      {/* Mobile: Checkbox */}
                      <Checkbox
                        checked={marketingEmails}
                        onCheckedChange={checked =>
                          handleNotificationChange('marketing', checked === true)
                        }
                        className='h-4 w-4 rounded-md md:hidden'
                      />
                      {/* Desktop: Switch */}
                      <Switch
                        checked={marketingEmails}
                        onCheckedChange={checked =>
                          handleNotificationChange('marketing', checked === true)
                        }
                        className='hidden md:flex'
                      />
                    </div>
                  </div>

                  <Separator className='md:block hidden' />

                  {/* Notification Item */}
                  <div
                    className='flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer md:p-3 md:border-0 md:rounded-none md:hover:bg-transparent'
                    onClick={() => handleNotificationChange('newVideos', !newVideosNotifications)}
                  >
                    <div className='space-y-1 flex-1 mr-4'>
                      <Label className='text-base md:text-sm cursor-pointer'>Nuevos videos</Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones cuando se suban nuevos videos
                      </p>
                    </div>
                    <div className='flex-shrink-0'>
                      {/* Mobile: Checkbox */}
                      <Checkbox
                        checked={newVideosNotifications}
                        onCheckedChange={checked =>
                          handleNotificationChange('newVideos', checked === true)
                        }
                        className='h-4 w-4 rounded-md md:hidden'
                      />
                      {/* Desktop: Switch */}
                      <Switch
                        checked={newVideosNotifications}
                        onCheckedChange={checked =>
                          handleNotificationChange('newVideos', checked === true)
                        }
                        className='hidden md:flex'
                      />
                    </div>
                  </div>

                  <Separator className='md:block hidden' />

                  {/* Notification Item */}
                  <div
                    className='flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer md:p-3 md:border-0 md:rounded-none md:hover:bg-transparent'
                    onClick={() => handleNotificationChange('comments', !commentsNotifications)}
                  >
                    <div className='space-y-1 flex-1 mr-4'>
                      <Label className='text-base md:text-sm cursor-pointer'>Comentarios</Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones de comentarios en tus videos
                      </p>
                    </div>
                    <div className='flex-shrink-0'>
                      {/* Mobile: Checkbox */}
                      <Checkbox
                        checked={commentsNotifications}
                        onCheckedChange={checked =>
                          handleNotificationChange('comments', checked === true)
                        }
                        className='h-4 w-4 rounded-md md:hidden'
                      />
                      {/* Desktop: Switch */}
                      <Switch
                        checked={commentsNotifications}
                        onCheckedChange={checked =>
                          handleNotificationChange('comments', checked === true)
                        }
                        className='hidden md:flex'
                      />
                    </div>
                  </div>

                  <Separator className='md:block hidden' />

                  {/* Notification Item */}
                  <div
                    className='flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer md:p-3 md:border-0 md:rounded-none md:hover:bg-transparent'
                    onClick={() => handleNotificationChange('likes', !likesNotifications)}
                  >
                    <div className='space-y-1 flex-1 mr-4'>
                      <Label className='text-base md:text-sm cursor-pointer'>Likes</Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones cuando recibas likes
                      </p>
                    </div>
                    <div className='flex-shrink-0'>
                      {/* Mobile: Checkbox */}
                      <Checkbox
                        checked={likesNotifications}
                        onCheckedChange={checked =>
                          handleNotificationChange('likes', checked === true)
                        }
                        className='h-4 w-4 rounded-md md:hidden'
                      />
                      {/* Desktop: Switch */}
                      <Switch
                        checked={likesNotifications}
                        onCheckedChange={checked =>
                          handleNotificationChange('likes', checked === true)
                        }
                        className='hidden md:flex'
                      />
                    </div>
                  </div>

                  <Separator className='md:block hidden' />

                  {/* Notification Item */}
                  <div
                    className='flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer md:p-3 md:border-0 md:rounded-none md:hover:bg-transparent'
                    onClick={() => handleNotificationChange('followers', !followersNotifications)}
                  >
                    <div className='space-y-1 flex-1 mr-4'>
                      <Label className='text-base md:text-sm cursor-pointer'>
                        Nuevos seguidores
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones cuando tengas nuevos seguidores
                      </p>
                    </div>
                    <div className='flex-shrink-0'>
                      {/* Mobile: Checkbox */}
                      <Checkbox
                        checked={followersNotifications}
                        onCheckedChange={checked =>
                          handleNotificationChange('followers', checked === true)
                        }
                        className='h-4 w-4 rounded-md md:hidden'
                      />
                      {/* Desktop: Switch */}
                      <Switch
                        checked={followersNotifications}
                        onCheckedChange={checked =>
                          handleNotificationChange('followers', checked === true)
                        }
                        className='hidden md:flex'
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Zona de peligro */}
              <Card className='border-destructive/50 bg-destructive/5'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-destructive'>
                    <Trash2 className='h-5 w-5' />
                    Zona de peligro
                  </CardTitle>
                  <CardDescription>Acciones irreversibles en tu cuenta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center justify-between p-4 border border-destructive/20 rounded-lg'>
                    <div className='space-y-1'>
                      <Label className='text-destructive'>Eliminar cuenta</Label>
                      <p className='text-sm text-muted-foreground'>
                        Elimina permanentemente tu cuenta y todos los datos asociados
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='destructive'>
                          <Trash2 className='h-4 w-4 mr-2' />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente tu
                            cuenta y todos los datos asociados de nuestros servidores.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                          >
                            Sí, eliminar cuenta
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>

              {/* Botón de guardar fijo */}
              <div className='sticky bottom-0 bg-background/80 backdrop-blur-sm border-t p-4 -mx-6 md:p-4'>
                <div className='max-w-4xl mx-auto flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-2'>
                  {hasAnyChanges && (
                    <Button
                      variant='outline'
                      onClick={handleCancelChanges}
                      disabled={saving}
                      className='w-full md:w-auto h-12 md:h-10 text-base md:text-sm'
                    >
                      Cancelar cambios
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveAll}
                    disabled={!hasAnyChanges || saving}
                    className='w-full md:w-auto min-w-[140px] h-12 md:h-10 text-base md:text-sm'
                  >
                    <Save className='h-5 w-5 mr-2 md:h-4 md:w-4' />
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
