'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import HeaderDynamic from '@/components/HeaderDynamic'
import { NavigationLink } from '@/components/NavigationLink'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { VideoInteractions } from '@/components/VideoInteractions'
import { useAuth } from '@/contexts/AuthContext'
import { getSubscriptionService } from '@/lib/di/serviceRegistration'
import { Video, recordVideoView } from '@/lib/firestore'
import { useToast } from '@/lib/hooks/use-toast'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'
import { setIsMobile } from '@/lib/store/slices/uiSlice'

// Dynamic imports for heavy components
const VideoCarousel = dynamic(() => import('./VideoCarousel'), {
  loading: () => (
    <div className='absolute top-0 left-0 right-0 bg-background bg-opacity-80 backdrop-blur-sm p-4'>
      <div className='animate-pulse'>
        <div className='h-4 bg-gray-300 rounded mb-2 w-32' />
        <div className='flex space-x-2'>
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className='aspect-video bg-gray-300 rounded-lg flex-shrink-0'
              style={{ width: '200px' }}
            />
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false,
})

interface WatchPageClientProps {
  video: Video | null
  recommendedVideos: Video[]
}

interface CreatorProfile {
  displayName: string | null
  photoURL: string | null
}

export default function WatchPageClient({ video, recommendedVideos }: WatchPageClientProps) {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const isMobile = useAppSelector(state => state.ui.isMobile)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null)
  const lastScrollTop = useRef(0)
  const videoRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const subscriptionService = getSubscriptionService()

  useEffect(() => {
    if (!video) return

    // Load creator profile
    const loadCreatorProfile = async () => {
      try {
        const { getUserById } = await import('@/lib/firestore')
        const profile = await getUserById(video.uploaderId)
        setCreatorProfile(profile)
      } catch {
        // Error loading creator profile, use defaults
        setCreatorProfile({
          displayName: video.uploaderName,
          photoURL: null,
        })
      }
    }

    loadCreatorProfile()

    // Record view count if user is logged in
    if (user?.uid) {
      recordVideoView(video.id, user.uid)
    }

    // Check subscription status if user is logged in and not own video
    if (user?.uid && video.uploaderId !== user.uid) {
      const checkSubscription = async () => {
        try {
          const subscriptionRelation = await subscriptionService.getSubscriptionRelation(
            video.uploaderId,
            user.uid
          )
          setIsSubscribed(subscriptionRelation.isSubscribed)
        } catch {
          // Error loading subscription status
        }
      }
      checkSubscription()
    }
  }, [video, user?.uid, subscriptionService])

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
    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!video || video.uploaderId === user.uid || subscriptionLoading) {
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
      toast({
        title: 'Error',
        description: 'Hubo un problema al procesar tu suscripción. Inténtalo de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setSubscriptionLoading(false)
    }
  }

  if (!video) {
    return (
      <div className='flex flex-col min-h-screen'>
        <HeaderDynamic visible={showHeader} onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-20'>
          <Sidebar />
          <div className='flex-1 flex items-center justify-center w-full min-w-0 overflow-x-hidden'>
            <p className='text-red-600 text-center'>Video no encontrado</p>
          </div>
        </div>
      </div>
    )
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
              {!isMobile && (
                <div ref={carouselRef}>
                  <VideoCarousel
                    videos={recommendedVideos}
                    onShow={showRecommendations && recommendedVideos.length > 0}
                  />
                </div>
              )}
            </div>
            <div className='space-y-4'>
              <h1 className='text-lg sm:text-2xl font-bold'>{video.title}</h1>
              <div className='flex items-center space-x-3 sm:space-x-4'>
                <NavigationLink href={`/profile/${video.uploaderId}`}>
                  {creatorProfile === null ? (
                    <div className='w-10 h-10 bg-gray-200 rounded-full animate-pulse' />
                  ) : (
                    <Image
                      src={creatorProfile?.photoURL || '/placeholder.svg?text=Avatar'}
                      alt='Avatar del canal'
                      width={40}
                      height={40}
                      className='rounded-full hover:opacity-80 transition-opacity cursor-pointer'
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.svg?text=Avatar'
                      }}
                    />
                  )}
                </NavigationLink>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center space-x-2'>
                    <NavigationLink href={`/profile/${video.uploaderId}`}>
                      <p className='font-semibold text-sm sm:text-base truncate hover:text-primary transition-colors cursor-pointer'>
                        {creatorProfile?.displayName || video.uploaderName}
                      </p>
                    </NavigationLink>
                    {video && (!user || video.uploaderId !== user.uid) && (
                      <Button
                        size='sm'
                        className='ml-2 flex-shrink-0'
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
                  <p className='text-xs sm:text-sm text-muted-foreground'>Canal</p>
                </div>
              </div>

              <div className='bg-muted p-3 sm:p-4 rounded-lg touch-manipulation'>
                <p className='text-xs sm:text-sm'>
                  {video.viewCount.toLocaleString()} visualizaciones
                </p>
                <p className='mt-2 text-sm sm:text-base'>
                  {video.description || 'Sin descripción'}
                </p>
              </div>

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
