'use client'

import { Bell, Camera, Edit, Lock, Save, Shield, Trash2, User, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'

import Header from '@/app/components/Header'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { getUserService } from '@/lib/di/serviceRegistration'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'

export default function SettingsPage() {
  const { user } = useAppSelector(state => state.auth)
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

  const loadUserData = useCallback(async () => {
    try {
      if (!user) return

      setDisplayName(user.displayName || '')

      // Verificar si es usuario de Google
      const isGoogle =
        (user as { providerData?: { providerId: string }[] }).providerData?.some(
          (provider: { providerId: string }) => provider.providerId === 'google.com'
        ) ?? false
      setIsGoogleUser(isGoogle)

      // Cargar configuraciones del usuario
      try {
        const settings = await userService.getUserSettings(user.uid)
        setEmailNotifications(settings?.notifications?.email ?? true)
        setPushNotifications(settings?.notifications?.push ?? true)
        setMarketingEmails(settings?.notifications?.marketing ?? false)
        setNewVideosNotifications(settings?.notifications?.newVideos ?? true)
        setCommentsNotifications(settings?.notifications?.comments ?? true)
        setLikesNotifications(settings?.notifications?.likes ?? true)
        setFollowersNotifications(settings?.notifications?.followers ?? true)
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
    if (!user) {
      router.push('/auth/login')
      return
    }
    loadUserData()
  }, [user, router, loadUserData])

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      await userService.updateUser(user.uid, {
        displayName: displayName.trim() || user.displayName || undefined,
      })

      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios se han guardado correctamente',
      })
      setIsEditing(false)
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationChange = async (type: string, value: boolean) => {
    if (!user) return

    try {
      const settings = {
        notifications: {
          email: type === 'email' ? value : emailNotifications,
          push: type === 'push' ? value : pushNotifications,
          marketing: type === 'marketing' ? value : marketingEmails,
          newVideos: type === 'newVideos' ? value : newVideosNotifications,
          comments: type === 'comments' ? value : commentsNotifications,
          likes: type === 'likes' ? value : likesNotifications,
          followers: type === 'followers' ? value : followersNotifications,
        },
      }

      await userService.updateUserSettings(user.uid, settings)

      if (type === 'email') setEmailNotifications(value)
      if (type === 'push') setPushNotifications(value)
      if (type === 'marketing') setMarketingEmails(value)
      if (type === 'newVideos') setNewVideosNotifications(value)
      if (type === 'comments') setCommentsNotifications(value)
      if (type === 'likes') setLikesNotifications(value)
      if (type === 'followers') setFollowersNotifications(value)

      toast({
        title: 'Configuración actualizada',
        description: 'Las preferencias de notificación se han guardado',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la configuración',
        variant: 'destructive',
      })
    }
  }

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

  if (loading) {
    return (
      <div className='flex flex-col h-screen'>
        <Header onMenuClick={() => dispatch(toggleSidebar())} />
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
        <Header onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <div className='flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/20 p-6'>
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
                      <Button
                        size='sm'
                        variant='secondary'
                        className='absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0'
                      >
                        <Camera className='h-4 w-4' />
                      </Button>
                    </div>

                    <div className='flex-1 space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='displayName'>Nombre de usuario</Label>
                        <div className='flex gap-2'>
                          <Input
                            id='displayName'
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            disabled={!isEditing}
                            placeholder='Tu nombre de usuario'
                          />
                          {!isEditing ? (
                            <Button variant='outline' size='sm' onClick={() => setIsEditing(true)}>
                              <Edit className='h-4 w-4' />
                            </Button>
                          ) : (
                            <div className='flex gap-1'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={handleSaveProfile}
                                disabled={saving}
                              >
                                <Save className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  setIsEditing(false)
                                  setDisplayName(user.displayName || '')
                                }}
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            </div>
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

                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <Label>Autenticación de dos factores</Label>
                      <p className='text-sm text-muted-foreground'>
                        Añade una capa extra de seguridad
                      </p>
                    </div>
                    <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
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
                <CardContent className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <Label>Notificaciones por email</Label>
                      <p className='text-sm text-muted-foreground'>
                        Recibe actualizaciones importantes por correo
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={checked => handleNotificationChange('email', checked)}
                    />
                  </div>

                  <Separator />

                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <Label>Notificaciones push</Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones en tiempo real en tu dispositivo
                      </p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={checked => handleNotificationChange('push', checked)}
                    />
                  </div>

                  <Separator />

                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <Label>Emails de marketing</Label>
                      <p className='text-sm text-muted-foreground'>
                        Ofertas especiales y noticias del producto
                      </p>
                    </div>
                    <Switch
                      checked={marketingEmails}
                      onCheckedChange={checked => handleNotificationChange('marketing', checked)}
                    />
                  </div>

                  <Separator />

                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <Label>Nuevos videos</Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones cuando se suban nuevos videos
                      </p>
                    </div>
                    <Switch
                      checked={newVideosNotifications}
                      onCheckedChange={checked => handleNotificationChange('newVideos', checked)}
                    />
                  </div>

                  <Separator />

                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <Label>Comentarios</Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones de comentarios en tus videos
                      </p>
                    </div>
                    <Switch
                      checked={commentsNotifications}
                      onCheckedChange={checked => handleNotificationChange('comments', checked)}
                    />
                  </div>

                  <Separator />

                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <Label>Likes</Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones cuando recibas likes
                      </p>
                    </div>
                    <Switch
                      checked={likesNotifications}
                      onCheckedChange={checked => handleNotificationChange('likes', checked)}
                    />
                  </div>

                  <Separator />

                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <Label>Nuevos seguidores</Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones cuando tengas nuevos seguidores
                      </p>
                    </div>
                    <Switch
                      checked={followersNotifications}
                      onCheckedChange={checked => handleNotificationChange('followers', checked)}
                    />
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
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
