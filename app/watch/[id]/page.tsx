'use client'

import { Play } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Slider from 'react-slick'

import { NavigationLink } from '@/components/NavigationLink'
import { Button } from '@/components/ui/button'
import { VideoInteractions } from '@/components/VideoInteractions'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { getSubscriptionService } from '@/lib/di/serviceRegistration'
import { Video, getPublicVideos, getVideoById, recordVideoView, getUserById } from '@/lib/firestore'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'
import { setIsMobile } from '@/lib/store/slices/uiSlice'
import { UserProfile } from '@/types/user'

import HeaderDynamic from '../../components/HeaderDynamic'
import Sidebar from '../../components/Sidebar'

export default function WatchPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { toast } = useToast()
  const isMobile = useAppSelector(state => state.ui.isMobile)
  const [video, setVideo] = useState<Video | null>(null)
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [uploaderProfile, setUploaderProfile] = useState<UserProfile | null>(null)
  const lastScrollTop = useRef(0)
  const videoRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const subscriptionService = getSubscriptionService()

  useEffect(() => {
    if (!id || typeof id !== 'string') return

    const fetchVideo = async () => {
      try {
        setLoading(true)
        setError(null)

        const videoData = await getVideoById(id)
        if (!videoData) {
          setError('Video no encontrado')
          return
        }

        setVideo(videoData)

        // Record view count if user is logged in
        if (user?.uid) {
          await recordVideoView(id, user.uid)
        }

        // Check subscription status if user is logged in and not own video
        if (user?.uid && videoData.uploaderId !== user.uid) {
          try {
            const subscriptionRelation = await subscriptionService.getSubscriptionRelation(
              videoData.uploaderId,
              user.uid
            )
            setIsSubscribed(subscriptionRelation.isSubscribed)
          } catch {
            // Error loading subscription status
          }
        }

        // Fetch recommended videos
        const recommended = await getPublicVideos(10)
        setRecommendedVideos(recommended.filter(v => v.id !== id))
      } catch {
        setError('Error al cargar el video')
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [id, user?.uid, subscriptionService])

  useEffect(() => {
    const checkMobile = () => {
      dispatch(setIsMobile(window.innerWidth <= 768))
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [dispatch])

  useEffect(() => {
    if (video?.uploaderId) {
      const fetchUploaderProfile = async () => {
        try {
          const profile = await getUserById(video.uploaderId)
          setUploaderProfile(profile)
        } catch {
          // Error fetching uploader profile
        }
      }
      fetchUploaderProfile()
    }
  }, [video?.uploaderId])

  useEffect(() => {
    const carousel = carouselRef.current

    const handleScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop
      if (st > lastScrollTop.current) {
        setShowHeader(false)
      } else {
        setShowHeader(true)
      }
      lastScrollTop.current = st <= 0 ? 0 : st
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (videoRef.current) {
        const rect = videoRef.current.getBoundingClientRect()
        setShowRecommendations(e.clientY < rect.top + 200)
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (carousel && !carousel.contains(e.relatedTarget as Node)) {
        setShowRecommendations(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    if (carousel) {
      carousel.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      if (carousel) {
        carousel.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  const handleSubscribe = async () => {
    if (!user || !video || video.uploaderId === user.uid || subscriptionLoading) {
      return
    }

    setSubscriptionLoading(true)

    try {
      if (isSubscribed) {
        await subscriptionService.unsubscribe(video.uploaderId, user.uid)
        setIsSubscribed(false)
        toast({
          title: 'Te has desuscrito',
          description: `Ya no seguirás a ${video.uploaderName}`,
        })
      } else {
        await subscriptionService.subscribe(video.uploaderId, user.uid)
        setIsSubscribed(true)
        toast({
          title: '¡Suscrito!',
          description: `Ahora sigues a ${video.uploaderName}`,
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

  if (loading) {
    return (
      <div className='flex flex-col min-h-screen'>
        <HeaderDynamic visible={showHeader} onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-20'>
          <Sidebar />
          <div className='flex-1 flex items-center justify-center w-full min-w-0 overflow-x-hidden'>
            <p className='text-center'>Cargando video...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className='flex flex-col min-h-screen'>
        <HeaderDynamic visible={showHeader} onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-20'>
          <Sidebar />
          <div className='flex-1 flex items-center justify-center w-full min-w-0 overflow-x-hidden'>
            <p className='text-red-600 text-center'>{error || 'Video no encontrado'}</p>
          </div>
        </div>
      </div>
    )
  }

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '0',
    focusOnSelect: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <HeaderDynamic visible={showHeader} onMenuClick={() => dispatch(toggleSidebar())} />
      <div className='flex flex-1 overflow-hidden pt-20'>
        <Sidebar />
        <div className='flex-1 w-full min-w-0 overflow-x-hidden overflow-y-auto md:h-auto mobile-scroll-container ios-scroll-fix'>
          <div className='p-1 xs:p-2 sm:p-4 space-y-4 pb-safe-area-inset-bottom w-full min-w-0 max-w-full'>
            <div className='relative' ref={videoRef}>
              <div className='aspect-video bg-black rounded-lg overflow-hidden'>
                <video
                  src={video.videoURLs.original}
                  poster={video.thumbnailURL}
                  controls
                  className='w-full h-full object-cover touch-manipulation'
                  preload='metadata'
                  playsInline
                  controlsList='nodownload'
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
              {!isMobile && showRecommendations && recommendedVideos.length > 0 && (
                <div
                  ref={carouselRef}
                  className='absolute top-0 left-0 right-0 bg-background bg-opacity-80 backdrop-blur-sm p-4 transition-opacity duration-300'
                >
                  <h3 className='font-bold mb-2'>Videos recomendados</h3>
                  <Slider {...sliderSettings} className='carousel-3d'>
                    {recommendedVideos.map(recVideo => (
                      <div key={recVideo.id} className='px-2 carousel-item'>
                        <NavigationLink href={`/watch/${recVideo.id}`} className='block'>
                          <div className='aspect-video bg-muted rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-110 hover:z-10 relative'>
                            <Image
                              src={recVideo.thumbnailURL || '/placeholder.svg?text=Video'}
                              alt={recVideo.title}
                              width={320}
                              height={180}
                              className='object-cover w-full h-full'
                            />
                            <div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 hover:opacity-100'>
                              <Play className='text-white w-8 h-8' />
                            </div>
                          </div>
                          <p className='text-sm font-semibold truncate mt-1'>{recVideo.title}</p>
                          <p className='text-xs text-muted-foreground'>{recVideo.uploaderName}</p>
                        </NavigationLink>
                      </div>
                    ))}
                  </Slider>
                </div>
              )}
            </div>
            <div className='space-y-4'>
              <h1 className='text-lg sm:text-2xl font-bold'>{video.title}</h1>
              <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
                <div className='flex items-center space-x-3 sm:space-x-4'>
                  <NavigationLink href={`/profile/${video.uploaderId}`}>
                    <Image
                      src={uploaderProfile?.photoURL || '/placeholder.svg?text=Avatar'}
                      alt='Avatar del canal'
                      width={40}
                      height={40}
                      className='rounded-full hover:opacity-80 transition-opacity'
                    />
                  </NavigationLink>
                  <div className='flex-1 min-w-0 sm:flex-none'>
                    <NavigationLink href={`/profile/${video.uploaderId}`}>
                      <p className='font-semibold text-sm sm:text-base truncate hover:underline cursor-pointer'>
                        {video.uploaderName}
                      </p>
                    </NavigationLink>
                    <p className='text-xs sm:text-sm text-muted-foreground'>Canal</p>
                  </div>
                  {/* Desktop: Button immediately after channel info */}
                  {user && video && video.uploaderId !== user.uid && (
                    <Button
                      size='sm'
                      className='hidden sm:inline-flex sm:ml-4'
                      onClick={handleSubscribe}
                      disabled={subscriptionLoading}
                      variant={isSubscribed ? 'outline' : 'default'}
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
                </div>
                {/* Mobile: Full width button below */}
                {user && video && video.uploaderId !== user.uid && (
                  <Button
                    size='sm'
                    className='w-full sm:hidden'
                    onClick={handleSubscribe}
                    disabled={subscriptionLoading}
                    variant={isSubscribed ? 'outline' : 'default'}
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
              </div>

              <div className='bg-muted p-3 sm:p-4 rounded-lg touch-manipulation'>
                <p className='text-xs sm:text-sm'>
                  {video.viewCount.toLocaleString()} visualizaciones
                </p>
                <p className='mt-2 text-sm sm:text-base'>
                  {video.description || 'Sin descripción'}
                </p>
              </div>

              {/* Video interactions component */}
              <VideoInteractions
                videoId={video.id}
                likes={video.likeCount}
                dislikes={video.dislikeCount}
                isLiked={false}
                isDisliked={false}
                isSaved={false}
                rating={video.rating || 0}
                ratingCount={video.ratingCount || 0}
                userRating={0}
                comments={[]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
