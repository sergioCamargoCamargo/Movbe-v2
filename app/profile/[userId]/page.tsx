'use client'

import {
  Calendar,
  Eye,
  Heart,
  Play,
  Settings,
  Share2,
  Users,
  Video as VideoIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import HeaderDynamic from '@/components/HeaderDynamic'
import { NavigationLink } from '@/components/NavigationLink'
import { PageTransition } from '@/components/PageTransition'
import Sidebar from '@/components/Sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSubscriptionService } from '@/lib/di/serviceRegistration'
import { useToast } from '@/lib/hooks/use-toast'
import { EnhancedUserService } from '@/lib/services/EnhancedUserService'
import { Video as FirestoreVideoType, VideoService } from '@/lib/services/VideoService'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'
import { FirestoreTimestamp } from '@/lib/types'

// Default profile structure
const defaultProfile = {
  id: '',
  name: 'Usuario',
  username: '@usuario',
  bio: 'Creador de contenido en MOVBE',
  avatar: '/placeholder.svg?text=USER',
  coverImage: '/placeholder.svg?text=Cover',
  subscriberCount: 0,
  videoCount: 0,
  totalViews: 0,
  joinDate: 'Recientemente',
  isSubscribed: false,
  isOwnProfile: false,
  socialLinks: {
    twitter: '',
    instagram: '',
    youtube: '',
  },
}

export default function ProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const dispatch = useAppDispatch()
  const { user, userProfile, loading } = useAppSelector(state => state.auth)
  const { toast } = useToast()
  const router = useRouter()

  // Check if this is the current user's profile
  const isOwnProfile = user?.uid === userId

  // State for profile data
  const [profileData, setProfileData] = useState(defaultProfile)
  const [profileLoading, setProfileLoading] = useState(true)

  // Load profile data when component mounts
  useEffect(() => {
    const loadProfileData = async () => {
      if (isOwnProfile && userProfile) {
        // Use current user's profile
        setProfileData({
          id: userProfile.uid,
          name: userProfile.displayName || user?.displayName || 'Usuario',
          username: `@${userProfile.displayName?.toLowerCase().replace(/\s+/g, '') || 'usuario'}`,
          bio: 'Creador de contenido en MOVBE', // TODO: Add bio field to user profile
          avatar: userProfile.photoURL || user?.photoURL || '/placeholder.svg?text=USER',
          coverImage: '/placeholder.svg?text=Cover', // TODO: Add cover image field
          subscriberCount: userProfile.subscriberCount || 0,
          videoCount: userProfile.videoCount || 0,
          totalViews: userProfile.totalViews || 0,
          joinDate: userProfile.createdAt
            ? new Date(userProfile.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
              })
            : 'Recientemente',
          isSubscribed: false,
          isOwnProfile: true,
          socialLinks: {
            twitter: '',
            instagram: '',
            youtube: '',
          },
        })
        setProfileLoading(false)
      } else if (userId) {
        // Load other user's profile
        try {
          setProfileLoading(true)
          const userService = new EnhancedUserService()
          const otherUserProfile = await userService.getUserById(userId)

          if (otherUserProfile) {
            setProfileData({
              id: otherUserProfile.uid,
              name: otherUserProfile.displayName || 'Usuario',
              username: `@${otherUserProfile.displayName?.toLowerCase().replace(/\s+/g, '') || 'usuario'}`,
              bio: 'Creador de contenido en MOVBE',
              avatar: otherUserProfile.photoURL || '/placeholder.svg?text=USER',
              coverImage: '/placeholder.svg?text=Cover',
              subscriberCount: otherUserProfile.subscriberCount || 0,
              videoCount: otherUserProfile.videoCount || 0,
              totalViews: otherUserProfile.totalViews || 0,
              joinDate: otherUserProfile.createdAt
                ? new Date(otherUserProfile.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                  })
                : 'Recientemente',
              isSubscribed: false,
              isOwnProfile: false,
              socialLinks: {
                twitter: '',
                instagram: '',
                youtube: '',
              },
            })
          }
        } catch {
          // Error loading profile, set default profile with userId
          setProfileData({
            ...defaultProfile,
            id: userId,
            name: 'Usuario no encontrado',
            username: '@usuario',
          })
        } finally {
          setProfileLoading(false)
        }
      }
    }

    loadProfileData()
  }, [userId, isOwnProfile, userProfile, user])

  const [isSubscribed, setIsSubscribed] = useState(profileData.isSubscribed)
  const [subscriberCount, setSubscriberCountState] = useState(profileData.subscriberCount)
  const [userVideos, setUserVideos] = useState<FirestoreVideoType[]>([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [videosError, setVideosError] = useState<string | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)

  const subscriptionService = getSubscriptionService()

  // Load user videos when component mounts or userId changes
  useEffect(() => {
    const loadUserVideos = async () => {
      if (!userId) return

      try {
        setVideosLoading(true)
        setVideosError(null)
        const videoService = new VideoService()
        const videos = await videoService.getVideosByUser(userId)
        setUserVideos(videos)
      } catch {
        setVideosError('Error al cargar los videos')
      } finally {
        setVideosLoading(false)
      }
    }

    loadUserVideos()
  }, [userId])

  // Load subscription state when component mounts or userId changes
  useEffect(() => {
    const loadSubscriptionState = async () => {
      if (!userId || !user || userId === user.uid) {
        return
      }

      try {
        const [subscriptionRelation, subscriberCount] = await Promise.all([
          subscriptionService.getSubscriptionRelation(userId, user.uid),
          subscriptionService.getSubscriberCount(userId),
        ])

        setIsSubscribed(subscriptionRelation.isSubscribed)
        setSubscriberCountState(subscriberCount)
      } catch {
        // Error loading subscription state, fallback to get subscriber count
        try {
          const subscriberCount = await subscriptionService.getSubscriberCount(userId)
          setSubscriberCountState(subscriberCount)
        } catch {
          // Final fallback
          setSubscriberCountState(0)
        }
      }
    }

    loadSubscriptionState()
  }, [userId, user, subscriptionService])

  // Show loading state while auth is loading or profile is loading
  if (loading || profileLoading) {
    return (
      <PageTransition>
        <div className='flex flex-col h-screen'>
          <HeaderDynamic onMenuClick={() => dispatch(toggleSidebar())} />
          <div className='flex flex-1 overflow-hidden pt-20'>
            <Sidebar />
            <div className='flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/30 w-full min-w-0 overflow-x-hidden md:h-auto mobile-scroll-container ios-scroll-fix'>
              <div className='max-w-7xl mx-auto p-1 xs:p-4 sm:p-6 md:p-8 w-full min-w-0'>
                <div className='animate-pulse'>
                  <div className='h-48 sm:h-64 md:h-80 lg:h-96 bg-muted rounded-lg mb-8'></div>
                  <div className='space-y-4'>
                    <div className='h-8 bg-muted rounded w-1/3'></div>
                    <div className='h-4 bg-muted rounded w-1/2'></div>
                    <div className='h-4 bg-muted rounded w-1/4'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  const handleSubscribe = async () => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!userId || userId === user.uid || subscriptionLoading) {
      return
    }

    setSubscriptionLoading(true)

    try {
      if (isSubscribed) {
        await subscriptionService.unsubscribe(userId, user.uid)
        setIsSubscribed(false)
        setSubscriberCountState(prev => prev - 1)
        toast({
          title: 'Te has desuscrito',
          description: `Ya no seguirás a ${profileData.name}`,
        })
      } else {
        await subscriptionService.subscribe(userId, user.uid)
        setIsSubscribed(true)
        setSubscriberCountState(prev => prev + 1)
        toast({
          title: '¡Suscrito!',
          description: `Ahora sigues a ${profileData.name}`,
        })
      }
    } catch {
      // Error in subscription process
      toast({
        title: 'Error',
        description: 'Hubo un problema al procesar tu suscripción. Inténtalo de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setSubscriptionLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${profileData.name} en MOVBE`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Enlace copiado',
        description: 'El enlace del perfil se copió al portapapeles',
      })
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatUploadDate = (timestamp: FirestoreTimestamp) => {
    if (!timestamp) return 'Fecha desconocida'

    // Handle Firestore timestamp
    const date = new Date(timestamp.seconds * 1000) || new Date(timestamp.nanoseconds / 1000000)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'hace 1 día'
    if (diffDays < 7) return `hace ${diffDays} días`
    if (diffDays < 30)
      return `hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
    if (diffDays < 365)
      return `hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`
    return `hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) > 1 ? 's' : ''}`
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <PageTransition>
      <div className='flex flex-col h-screen'>
        <HeaderDynamic onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-20'>
          <Sidebar />
          <div className='flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/30 md:h-auto mobile-scroll-container ios-scroll-fix'>
            {/* Cover Image */}
            <div className='relative h-48 sm:h-64 md:h-80 lg:h-96'>
              <Image
                src={profileData.coverImage}
                alt={`Portada de ${profileData.name}`}
                fill
                className='object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

              {/* Profile Info Overlay */}
              <div className='absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 touch-manipulation'>
                <div className='space-y-3 sm:space-y-0'>
                  <div className='flex flex-row items-start sm:items-end gap-3 sm:gap-4'>
                    <Avatar className='h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 ring-4 ring-white/20 flex-shrink-0'>
                      <AvatarImage src={profileData.avatar} alt={profileData.name} />
                      <AvatarFallback className='text-lg sm:text-xl font-bold'>
                        {profileData.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className='flex-1 text-white min-w-0'>
                      <h1 className='text-lg sm:text-3xl md:text-4xl font-bold mb-1 truncate'>
                        {profileData.name}
                      </h1>
                      <p className='text-sm sm:text-xl text-white/80 mb-2 truncate'>
                        {profileData.username}
                      </p>
                      <div className='flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/70'>
                        <span className='flex items-center gap-1'>
                          <Users className='h-3 w-3 sm:h-4 sm:w-4' />
                          {formatNumber(subscriberCount)} suscriptores
                        </span>
                        <span className='flex items-center gap-1'>
                          <VideoIcon className='h-3 w-3 sm:h-4 sm:w-4' />
                          {userVideos.length} videos
                        </span>
                        <span className='flex items-center gap-1'>
                          <Eye className='h-3 w-3 sm:h-4 sm:w-4' />
                          {formatNumber(
                            userVideos.reduce((total, video) => total + video.viewCount, 0)
                          )}{' '}
                          vistas
                        </span>
                      </div>
                    </div>

                    <div className='hidden sm:flex gap-2 flex-wrap'>
                      {!isOwnProfile && (
                        <Button
                          onClick={handleSubscribe}
                          disabled={subscriptionLoading}
                          variant={isSubscribed ? 'outline' : 'default'}
                          className={`touch-manipulation min-w-[100px] ${
                            isSubscribed
                              ? 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                              : 'bg-primary hover:bg-primary/90'
                          }`}
                        >
                          {subscriptionLoading
                            ? isSubscribed
                              ? 'Cancelando...'
                              : 'Suscribiendo...'
                            : isSubscribed
                              ? 'Suscrito'
                              : 'Suscribirse'}
                        </Button>
                      )}

                      <Button
                        variant='outline'
                        size='icon'
                        onClick={handleShare}
                        className='bg-white/20 hover:bg-white/30 text-white border-white/30 touch-manipulation min-w-[44px] min-h-[44px]'
                        aria-label='Compartir perfil'
                      >
                        <Share2 className='h-4 w-4' />
                      </Button>

                      {isOwnProfile && (
                        <Button
                          variant='outline'
                          size='icon'
                          className='bg-white/20 hover:bg-white/30 text-white border-white/30 touch-manipulation min-w-[44px] min-h-[44px]'
                          aria-label='Configurar perfil'
                        >
                          <Settings className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Mobile buttons row */}
                  <div className='flex sm:hidden gap-2 flex-wrap'>
                    {!isOwnProfile && (
                      <Button
                        onClick={handleSubscribe}
                        disabled={subscriptionLoading}
                        variant={isSubscribed ? 'outline' : 'default'}
                        size='sm'
                        className={`touch-manipulation flex-1 min-w-[100px] ${
                          isSubscribed
                            ? 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                            : 'bg-primary hover:bg-primary/90'
                        }`}
                      >
                        {subscriptionLoading
                          ? isSubscribed
                            ? 'Cancelando...'
                            : 'Suscribiendo...'
                          : isSubscribed
                            ? 'Suscrito'
                            : 'Suscribirse'}
                      </Button>
                    )}

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleShare}
                      className='bg-white/20 hover:bg-white/30 text-white border-white/30 touch-manipulation'
                      aria-label='Compartir perfil'
                    >
                      <Share2 className='h-4 w-4' />
                    </Button>

                    {isOwnProfile && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='bg-white/20 hover:bg-white/30 text-white border-white/30 touch-manipulation'
                        aria-label='Configurar perfil'
                      >
                        <Settings className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className='max-w-7xl mx-auto p-1 xs:p-4 sm:p-6 md:p-8 w-full min-w-0'>
              <Tabs defaultValue='videos' className='space-y-6'>
                <TabsList className='grid w-full grid-cols-3 md:w-96 touch-manipulation'>
                  <TabsTrigger value='videos'>Videos</TabsTrigger>
                  <TabsTrigger value='about'>Acerca de</TabsTrigger>
                  <TabsTrigger value='stats'>Estadísticas</TabsTrigger>
                </TabsList>

                <TabsContent value='videos' className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold'>Videos ({userVideos.length})</h2>
                    <Button variant='outline' size='sm' className='touch-manipulation'>
                      Más recientes
                    </Button>
                  </div>

                  {videosLoading ? (
                    // Loading skeleton for videos
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6'>
                      {[...Array(8)].map((_, i) => (
                        <Card key={i} className='overflow-hidden'>
                          <div className='aspect-video bg-muted animate-pulse'></div>
                          <CardContent className='p-3 space-y-2'>
                            <div className='h-4 bg-muted rounded animate-pulse'></div>
                            <div className='h-3 bg-muted rounded w-3/4 animate-pulse'></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : videosError ? (
                    // Error state
                    <div className='text-center py-12'>
                      <VideoIcon className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                      <p className='text-muted-foreground'>{videosError}</p>
                    </div>
                  ) : userVideos.length === 0 ? (
                    // Empty state
                    <div className='text-center py-12'>
                      <VideoIcon className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                      <p className='text-muted-foreground'>
                        {isOwnProfile
                          ? 'Aún no has subido videos'
                          : 'Este usuario no ha subido videos'}
                      </p>
                      {isOwnProfile && (
                        <NavigationLink href='/upload'>
                          <Button className='mt-4 touch-manipulation'>Subir tu primer video</Button>
                        </NavigationLink>
                      )}
                    </div>
                  ) : (
                    // Videos grid
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6'>
                      {userVideos.map(video => (
                        <NavigationLink key={video.id} href={`/watch/${video.id}`}>
                          <Card className='overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group touch-manipulation transform hover:scale-105 active:scale-95'>
                            <div className='relative aspect-video'>
                              <Image
                                src={video.thumbnailURL || '/placeholder.svg?text=Video'}
                                alt={video.title}
                                fill
                                className='object-cover group-hover:scale-105 transition-transform duration-300'
                              />
                              <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center'>
                                <Play className='h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                              </div>
                              <div className='absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded'>
                                {formatDuration(video.duration)}
                              </div>
                            </div>

                            <CardContent className='p-3'>
                              <h3 className='font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors'>
                                {video.title}
                              </h3>
                              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                <span>{formatNumber(video.viewCount || 0)} vistas</span>
                                <span>•</span>
                                <span>
                                  {video.uploadDate
                                    ? formatUploadDate(
                                        typeof video.uploadDate === 'object' &&
                                          'seconds' in video.uploadDate
                                          ? video.uploadDate
                                          : {
                                              seconds: Math.floor(
                                                new Date(video.uploadDate).getTime() / 1000
                                              ),
                                              nanoseconds: 0,
                                            }
                                      )
                                    : 'Fecha desconocida'}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </NavigationLink>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value='about' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Descripción</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-muted-foreground leading-relaxed'>{profileData.bio}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Información del Canal</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>Se unió en {profileData.joinDate}</span>
                      </div>

                      <Separator />

                      <div>
                        <h4 className='font-semibold mb-2'>Estadísticas</h4>
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                          <div className='text-center p-3 bg-muted/30 rounded-lg'>
                            <div className='text-2xl font-bold text-primary'>
                              {formatNumber(subscriberCount)}
                            </div>
                            <div className='text-sm text-muted-foreground'>Suscriptores</div>
                          </div>
                          <div className='text-center p-3 bg-muted/30 rounded-lg'>
                            <div className='text-2xl font-bold text-primary'>
                              {userVideos.length}
                            </div>
                            <div className='text-sm text-muted-foreground'>Videos</div>
                          </div>
                          <div className='text-center p-3 bg-muted/30 rounded-lg'>
                            <div className='text-2xl font-bold text-primary'>
                              {formatNumber(
                                userVideos.reduce((total, video) => total + video.viewCount, 0)
                              )}
                            </div>
                            <div className='text-sm text-muted-foreground'>Vistas totales</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='stats' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Eye className='h-5 w-5' />
                        Rendimiento del Canal
                      </CardTitle>
                      <CardDescription>Estadísticas públicas del canal</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                        <div className='text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg'>
                          <div className='text-2xl font-bold text-blue-600'>
                            {formatNumber(profileData.totalViews)}
                          </div>
                          <div className='text-sm text-blue-600/70'>Vistas Totales</div>
                        </div>

                        <div className='text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg'>
                          <div className='text-2xl font-bold text-green-600'>
                            {formatNumber(subscriberCount)}
                          </div>
                          <div className='text-sm text-green-600/70'>Suscriptores</div>
                        </div>

                        <div className='text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg'>
                          <div className='text-2xl font-bold text-purple-600'>
                            {profileData.videoCount}
                          </div>
                          <div className='text-sm text-purple-600/70'>Videos</div>
                        </div>

                        <div className='text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-lg'>
                          <div className='text-2xl font-bold text-orange-600'>
                            {formatNumber(
                              userVideos.reduce((total, video) => total + (video.likeCount || 0), 0)
                            )}
                          </div>
                          <div className='text-sm text-orange-600/70'>Likes Totales</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Videos Más Populares</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        {userVideos.length > 0 ? (
                          userVideos
                            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                            .slice(0, 3)
                            .map((video, index) => (
                              <NavigationLink key={video.id} href={`/watch/${video.id}`}>
                                <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors'>
                                  <div className='flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                                    <span className='text-sm font-bold text-primary'>
                                      #{index + 1}
                                    </span>
                                  </div>
                                  <div className='flex-1'>
                                    <h4 className='font-semibold text-sm'>{video.title}</h4>
                                    <p className='text-xs text-muted-foreground'>
                                      {formatNumber(video.viewCount || 0)} vistas
                                    </p>
                                  </div>
                                  <Heart className='h-4 w-4 text-red-500' />
                                </div>
                              </NavigationLink>
                            ))
                        ) : (
                          <div className='text-center py-8'>
                            <VideoIcon className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                            <p className='text-muted-foreground'>No hay videos para mostrar</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
