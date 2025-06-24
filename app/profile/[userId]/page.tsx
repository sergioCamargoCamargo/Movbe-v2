'use client'

import { Calendar, Eye, Heart, Play, Settings, Share2, Users, Video } from 'lucide-react'
import Image from 'next/image'
// import { useParams } from 'next/navigation'
import { useState } from 'react'

import Header from '@/app/components/Header'
import Sidebar from '@/app/components/Sidebar'
import { PageTransition } from '@/components/PageTransition'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSidebar } from '@/contexts/SidebarContext'
import { useToast } from '@/hooks/use-toast'

// Datos de ejemplo del perfil
const mockProfile = {
  id: '1',
  name: 'Juan Pérez',
  username: '@juanperez',
  bio: 'Creador de contenido apasionado por la tecnología y los videojuegos. Subiendo videos diarios sobre reviews, tutoriales y gameplays.',
  avatar: '/placeholder.svg?text=JP',
  coverImage: '/placeholder.svg?text=Cover',
  subscriberCount: 15420,
  videoCount: 89,
  totalViews: 1250000,
  joinDate: 'Marzo 2023',
  isSubscribed: false,
  isOwnProfile: false,
  socialLinks: {
    twitter: 'https://twitter.com/juanperez',
    instagram: 'https://instagram.com/juanperez',
    youtube: 'https://youtube.com/juanperez',
  },
}

const mockVideos = [
  {
    id: '1',
    title: 'Review del iPhone 15 Pro - ¿Vale la pena?',
    thumbnail: '/placeholder.svg?text=iPhone+15',
    duration: '12:34',
    views: 45000,
    uploadDate: 'hace 2 días',
    description: 'Un análisis completo del nuevo iPhone 15 Pro con todas sus características...',
  },
  {
    id: '2',
    title: 'Tutorial: Configurar tu PC Gaming desde cero',
    thumbnail: '/placeholder.svg?text=PC+Gaming',
    duration: '18:45',
    views: 32000,
    uploadDate: 'hace 1 semana',
    description: 'Guía paso a paso para armar tu primera PC gamer...',
  },
  {
    id: '3',
    title: 'Gameplay: Cyberpunk 2077 con RTX 4090',
    thumbnail: '/placeholder.svg?text=Cyberpunk',
    duration: '25:12',
    views: 78000,
    uploadDate: 'hace 2 semanas',
    description: 'Jugando Cyberpunk 2077 en máxima calidad con la RTX 4090...',
  },
  {
    id: '4',
    title: '10 Apps que DEBES tener en tu móvil en 2024',
    thumbnail: '/placeholder.svg?text=Apps+2024',
    duration: '8:22',
    views: 56000,
    uploadDate: 'hace 3 semanas',
    description: 'Las mejores aplicaciones móviles que no pueden faltar...',
  },
]

export default function ProfilePage() {
  // const params = useParams()
  // const userId = params.userId as string // TODO: Use for API calls
  const [isSubscribed, setIsSubscribed] = useState(mockProfile.isSubscribed)
  const [subscriberCount, setSubscriberCount] = useState(mockProfile.subscriberCount)
  const { toggleSidebar } = useSidebar()
  const { toast } = useToast()

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed)
    setSubscriberCount(prev => (isSubscribed ? prev - 1 : prev + 1))

    toast({
      title: isSubscribed ? 'Te has desuscrito' : '¡Suscrito!',
      description: isSubscribed
        ? `Ya no seguirás a ${mockProfile.name}`
        : `Ahora sigues a ${mockProfile.name}`,
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${mockProfile.name} en MOBVE`,
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

  return (
    <PageTransition>
      <div className='flex flex-col h-screen'>
        <Header onMenuClick={toggleSidebar} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <div className='flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/30'>
            {/* Cover Image */}
            <div className='relative h-48 sm:h-64 md:h-80 lg:h-96'>
              <Image
                src={mockProfile.coverImage}
                alt={`Portada de ${mockProfile.name}`}
                fill
                className='object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

              {/* Profile Info Overlay */}
              <div className='absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8'>
                <div className='flex flex-col sm:flex-row items-start sm:items-end gap-4'>
                  <Avatar className='h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 ring-4 ring-white/20'>
                    <AvatarImage src={mockProfile.avatar} alt={mockProfile.name} />
                    <AvatarFallback className='text-xl font-bold'>
                      {mockProfile.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex-1 text-white'>
                    <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-1'>
                      {mockProfile.name}
                    </h1>
                    <p className='text-lg sm:text-xl text-white/80 mb-2'>{mockProfile.username}</p>
                    <div className='flex flex-wrap items-center gap-4 text-sm text-white/70'>
                      <span className='flex items-center gap-1'>
                        <Users className='h-4 w-4' />
                        {formatNumber(subscriberCount)} suscriptores
                      </span>
                      <span className='flex items-center gap-1'>
                        <Video className='h-4 w-4' />
                        {mockProfile.videoCount} videos
                      </span>
                      <span className='flex items-center gap-1'>
                        <Eye className='h-4 w-4' />
                        {formatNumber(mockProfile.totalViews)} vistas
                      </span>
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    {!mockProfile.isOwnProfile && (
                      <Button
                        onClick={handleSubscribe}
                        variant={isSubscribed ? 'outline' : 'default'}
                        className={`${
                          isSubscribed
                            ? 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                            : 'bg-primary hover:bg-primary/90'
                        }`}
                      >
                        {isSubscribed ? 'Suscrito' : 'Suscribirse'}
                      </Button>
                    )}

                    <Button
                      variant='outline'
                      size='icon'
                      onClick={handleShare}
                      className='bg-white/20 hover:bg-white/30 text-white border-white/30'
                      aria-label='Compartir perfil'
                    >
                      <Share2 className='h-4 w-4' />
                    </Button>

                    {mockProfile.isOwnProfile && (
                      <Button
                        variant='outline'
                        size='icon'
                        className='bg-white/20 hover:bg-white/30 text-white border-white/30'
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
            <div className='max-w-7xl mx-auto p-4 sm:p-6 md:p-8'>
              <Tabs defaultValue='videos' className='space-y-6'>
                <TabsList className='grid w-full grid-cols-3 md:w-96'>
                  <TabsTrigger value='videos'>Videos</TabsTrigger>
                  <TabsTrigger value='about'>Acerca de</TabsTrigger>
                  <TabsTrigger value='stats'>Estadísticas</TabsTrigger>
                </TabsList>

                <TabsContent value='videos' className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold'>Videos ({mockProfile.videoCount})</h2>
                    <Button variant='outline' size='sm'>
                      Más recientes
                    </Button>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
                    {mockVideos.map(video => (
                      <Card
                        key={video.id}
                        className='overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group'
                      >
                        <div className='relative aspect-video'>
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fill
                            className='object-cover group-hover:scale-105 transition-transform duration-300'
                          />
                          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center'>
                            <Play className='h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                          </div>
                          <div className='absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded'>
                            {video.duration}
                          </div>
                        </div>

                        <CardContent className='p-3'>
                          <h3 className='font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors'>
                            {video.title}
                          </h3>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <span>{formatNumber(video.views)} vistas</span>
                            <span>•</span>
                            <span>{video.uploadDate}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value='about' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Descripción</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-muted-foreground leading-relaxed'>{mockProfile.bio}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Información del Canal</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>Se unió en {mockProfile.joinDate}</span>
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
                              {mockProfile.videoCount}
                            </div>
                            <div className='text-sm text-muted-foreground'>Videos</div>
                          </div>
                          <div className='text-center p-3 bg-muted/30 rounded-lg'>
                            <div className='text-2xl font-bold text-primary'>
                              {formatNumber(mockProfile.totalViews)}
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
                            {formatNumber(mockProfile.totalViews)}
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
                            {mockProfile.videoCount}
                          </div>
                          <div className='text-sm text-purple-600/70'>Videos</div>
                        </div>

                        <div className='text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-lg'>
                          <div className='text-2xl font-bold text-orange-600'>8.5K</div>
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
                        {mockVideos.slice(0, 3).map((video, index) => (
                          <div
                            key={video.id}
                            className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'
                          >
                            <div className='flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                              <span className='text-sm font-bold text-primary'>#{index + 1}</span>
                            </div>
                            <div className='flex-1'>
                              <h4 className='font-semibold text-sm'>{video.title}</h4>
                              <p className='text-xs text-muted-foreground'>
                                {formatNumber(video.views)} vistas
                              </p>
                            </div>
                            <Heart className='h-4 w-4 text-red-500' />
                          </div>
                        ))}
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
