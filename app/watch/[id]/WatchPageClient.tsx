'use client'

import { ChevronDown, MessageCircle, Play, Send } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import HeaderDynamic from '@/components/HeaderDynamic'
import { NavigationLink } from '@/components/NavigationLink'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { VideoInteractions } from '@/components/VideoInteractions'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/lib/hooks/use-toast'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { useVideoComments } from '@/lib/hooks/useVideoData'
import { EnhancedUserService } from '@/lib/services/EnhancedUserService'
import { Video, VideoService } from '@/lib/services/VideoService'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'
import {
  loadSubscriberCount,
  loadSubscriptionState,
  toggleSubscription,
} from '@/lib/store/slices/subscriptionSlice'
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
  const { trackPage, trackVideo, trackInteraction, trackCustomEvent } = useAnalytics()
  const isMobile = useAppSelector(state => state.ui.isMobile)
  const {
    subscriberCounts,
    subscriptionStates,
    loading: subscriptionLoading,
  } = useAppSelector(state => state.subscription)
  const [showHeader, setShowHeader] = useState(true)
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null)
  const [showAllComments, setShowAllComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [, setShowRecommendations] = useState(false)
  const lastScrollTop = useRef(0)
  const videoRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Get values from Redux store
  const subscriberCount = video ? subscriberCounts[video.uploaderId] || 0 : 0
  const subscriptionKey = video && user ? `${video.uploaderId}_${user.uid}` : ''
  const isSubscribed = subscriptionStates[subscriptionKey] || false
  const isSubscriptionLoading = video ? subscriptionLoading[video.uploaderId] || false : false
  const subscriberCountLoading = video ? subscriptionLoading[video.uploaderId] || false : false

  // Load comments for mobile section
  const {
    comments: videoComments,
    loading: commentsLoading,
    addComment,
  } = useVideoComments(video?.id || '')

  // Format timestamp for comments
  const formatCommentDate = (
    timestamp: { seconds: number; nanoseconds: number } | string | Date
  ) => {
    if (!timestamp) return 'Fecha desconocida'

    let date: Date
    if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      // Firestore timestamp
      date = new Date(timestamp.seconds * 1000)
    } else {
      // Regular date
      date = new Date(timestamp)
    }

    if (isNaN(date.getTime())) return 'Fecha desconocida'

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const commentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    const time = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    // Today
    if (commentDate.getTime() === today.getTime()) {
      return `Hoy ${time}`
    }

    // Yesterday
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    if (commentDate.getTime() === yesterday.getTime()) {
      return `Ayer ${time}`
    }

    // Always show year for dates that are not today or yesterday
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${time}`
  }

  useEffect(() => {
    if (!video) return

    // Track page view
    trackPage(`Watch: ${video.title}`)
    trackCustomEvent('video_view', 'Video', video.id, 1)

    // Load creator profile
    const loadCreatorProfile = async () => {
      try {
        const userService = new EnhancedUserService()
        const profile = await userService.getUserById(video.uploaderId)
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

    // Load subscription data
    dispatch(loadSubscriberCount(video.uploaderId))

    // Load subscription state if user is logged in and not own video
    if (user?.uid && video.uploaderId !== user.uid) {
      dispatch(loadSubscriptionState({ channelId: video.uploaderId, subscriberId: user.uid }))
    }

    // Record view count if user is logged in
    if (user?.uid) {
      const videoService = new VideoService()
      videoService.recordVideoView(video.id, user.uid)
    }
  }, [video, user?.uid, dispatch, trackPage, trackCustomEvent])

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
      trackInteraction('login_required', 'subscribe_button')
      router.push('/auth/login')
      return
    }

    if (!video || video.uploaderId === user.uid || isSubscriptionLoading) {
      return
    }

    trackInteraction('click', 'subscribe_button', { channelId: video.uploaderId, isSubscribed })

    try {
      const result = await dispatch(
        toggleSubscription({
          channelId: video.uploaderId,
          subscriberId: user.uid,
          isSubscribed,
        })
      ).unwrap()

      trackCustomEvent(
        result.isSubscribed ? 'subscribe' : 'unsubscribe',
        'Subscription',
        video.uploaderId,
        1
      )

      toast({
        title: result.isSubscribed ? '¡Suscrito!' : 'Te has desuscrito',
        description: result.isSubscribed
          ? `Ahora sigues a ${video.uploaderName}`
          : `Ya no seguirás a ${video.uploaderName}`,
      })
    } catch {
      trackCustomEvent('subscription_error', 'Error', video.uploaderId)
      toast({
        title: 'Error',
        description: 'Hubo un problema al procesar tu suscripción. Inténtalo de nuevo.',
        variant: 'destructive',
      })
    }
  }

  const handleMobileCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim() || !user || !video) {
      return
    }

    trackInteraction('submit', 'comment_form', {
      videoId: video.id,
      commentLength: newComment.length,
    })

    setIsAddingComment(true)

    try {
      const success = await addComment(newComment.trim())

      if (success) {
        trackCustomEvent('comment_added', 'Engagement', video.id, 1)
        setNewComment('')
        toast({
          title: 'Comentario agregado',
          description: 'Tu comentario se ha publicado correctamente',
        })
      } else {
        throw new Error('Failed to add comment')
      }
    } catch {
      trackCustomEvent('comment_error', 'Error', video.id)
      toast({
        title: 'Error',
        description: 'No se pudo agregar el comentario. Inténtalo de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setIsAddingComment(false)
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
            {/* Video Carousel - Above video (Desktop only) */}
            {!isMobile && recommendedVideos.length > 0 && (
              <div ref={carouselRef} className='mb-6'>
                <VideoCarousel videos={recommendedVideos} onShow={true} />
              </div>
            )}

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
                  onPlay={() => trackVideo('play', video.id, video.duration)}
                  onPause={() => trackVideo('pause', video.id, video.duration)}
                  onEnded={() => trackVideo('ended', video.id, video.duration)}
                  onSeeking={e => {
                    const currentTime = (e.target as HTMLVideoElement).currentTime
                    trackVideo('seek', video.id, video.duration, currentTime)
                  }}
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            </div>
            <div className='space-y-4'>
              <h1 className='text-lg sm:text-2xl font-bold'>{video.title}</h1>
              <div className='flex items-center space-x-3 sm:space-x-4'>
                <NavigationLink href={`/profile/${video.uploaderId}`}>
                  <div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer'>
                    {creatorProfile === null ? (
                      <div className='w-full h-full bg-gray-200 animate-pulse' />
                    ) : creatorProfile?.photoURL ? (
                      <Image
                        src={creatorProfile.photoURL}
                        alt='Avatar del canal'
                        width={40}
                        height={40}
                        className='w-full h-full object-cover'
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                        onError={e => {
                          const target = e.target as HTMLImageElement
                          const container = target.parentElement
                          if (container) {
                            container.innerHTML = `
                              <div class="w-full h-full bg-primary/20 flex items-center justify-center">
                                <span class="text-sm font-semibold text-primary">
                                  ${(creatorProfile?.displayName || video.uploaderName).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <div className='w-full h-full bg-primary/20 flex items-center justify-center'>
                        <span className='text-sm font-semibold text-primary'>
                          {(creatorProfile.displayName || video.uploaderName)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
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
                        disabled={isSubscriptionLoading}
                        variant={isSubscribed ? 'outline' : 'default'}
                      >
                        {isSubscriptionLoading
                          ? isSubscribed
                            ? 'Cancelando...'
                            : 'Suscribiendo...'
                          : isSubscribed
                            ? 'Suscrito'
                            : 'Suscribirse'}
                      </Button>
                    )}
                  </div>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    {subscriberCountLoading
                      ? 'Cargando...'
                      : `${subscriberCount.toLocaleString()} suscriptor${subscriberCount !== 1 ? 'es' : ''}`}
                  </p>
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
                comments={videoComments}
                showComments={!isMobile} // Hide entire comments section on mobile
              />

              {/* Mobile YouTube-Style Sections */}
              {isMobile && (
                <div className='mt-6 space-y-4'>
                  {/* Comments Section */}
                  <div className='border-t pt-4'>
                    <div
                      className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer active:bg-muted/50 transition-colors touch-manipulation'
                      onClick={() => setShowAllComments(!showAllComments)}
                    >
                      <MessageCircle className='w-5 h-5 text-muted-foreground' />
                      <div className='flex-1'>
                        <p className='font-semibold text-sm'>Comentarios</p>
                        <p className='text-xs text-muted-foreground'>
                          {commentsLoading ? 'Cargando...' : `${videoComments.length} comentarios`}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          showAllComments ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {/* Single Comment Preview */}
                    {!showAllComments && videoComments.length > 0 && (
                      <div className='mt-3 pl-4 border-l-2 border-muted'>
                        <div className='flex gap-3'>
                          <div className='w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0'>
                            <span className='text-xs font-semibold text-primary'>
                              {videoComments[0].userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-xs font-medium text-muted-foreground mb-1'>
                              {videoComments[0].userName}
                            </p>
                            <p className='text-sm line-clamp-2'>{videoComments[0].text}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comment Form - Only when expanded */}
                    {showAllComments && user && (
                      <form
                        onSubmit={handleMobileCommentSubmit}
                        className='mt-4 space-y-3 pb-4 border-b'
                      >
                        <Textarea
                          placeholder='Escribe un comentario...'
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          className='min-h-[60px] resize-none'
                          disabled={isAddingComment}
                        />
                        <div className='flex justify-between items-center'>
                          <span className='text-xs text-muted-foreground'>
                            {newComment.length}/1000
                          </span>
                          <Button
                            type='submit'
                            size='sm'
                            disabled={
                              !newComment.trim() || isAddingComment || newComment.length > 1000
                            }
                            className='flex items-center gap-2'
                          >
                            {isAddingComment ? (
                              <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white' />
                            ) : (
                              <Send className='h-3 w-3' />
                            )}
                            {isAddingComment ? 'Enviando...' : 'Comentar'}
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Login prompt for non-authenticated users */}
                    {showAllComments && !user && (
                      <div className='mt-4 p-4 bg-muted/30 rounded-lg text-center border-b mb-4'>
                        <p className='text-sm text-muted-foreground'>
                          <NavigationLink
                            href='/auth/login'
                            className='text-primary hover:underline'
                          >
                            Inicia sesión
                          </NavigationLink>{' '}
                          para comentar en este video
                        </p>
                      </div>
                    )}

                    {/* All Comments Expanded */}
                    {showAllComments && (
                      <div className='mt-4 space-y-4 max-h-80 overflow-y-auto'>
                        {commentsLoading ? (
                          <div className='flex items-center justify-center py-8'>
                            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                          </div>
                        ) : videoComments.length === 0 ? (
                          <div className='text-center py-8 text-muted-foreground'>
                            <MessageCircle className='w-12 h-12 mx-auto mb-2 opacity-50' />
                            <p>No hay comentarios aún</p>
                          </div>
                        ) : (
                          videoComments.map(comment => (
                            <div key={comment.id} className='flex gap-3 p-2'>
                              <div className='w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0'>
                                <span className='text-xs font-semibold text-primary'>
                                  {comment.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <p className='text-xs font-medium text-muted-foreground'>
                                    {comment.userName}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>
                                    {formatCommentDate(comment.createdAt)}
                                  </p>
                                </div>
                                <p className='text-sm'>{comment.text}</p>
                                {comment.likeCount > 0 && (
                                  <p className='text-xs text-muted-foreground mt-1'>
                                    ♥ {comment.likeCount}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recommended Videos Section */}
                  {recommendedVideos.length > 0 && (
                    <div className='border-t pt-4'>
                      <h3 className='font-bold mb-4 text-base'>Videos recomendados</h3>
                      <div className='space-y-3'>
                        {recommendedVideos.slice(0, 4).map(video => (
                          <NavigationLink key={video.id} href={`/watch/${video.id}`}>
                            <div className='flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors active:bg-muted touch-manipulation'>
                              <div className='relative flex-shrink-0 w-32 aspect-video bg-black/20 rounded overflow-hidden'>
                                <Image
                                  src={video.thumbnailURL || '/placeholder.svg?text=Video'}
                                  alt={video.title}
                                  fill
                                  className='object-cover'
                                />
                                <div className='absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity'>
                                  <Play className='text-white w-6 h-6' />
                                </div>
                              </div>
                              <div className='flex-1 min-w-0'>
                                <h4 className='font-semibold text-sm line-clamp-2 mb-1'>
                                  {video.title}
                                </h4>
                                <p className='text-xs text-muted-foreground mb-1'>
                                  {video.uploaderName}
                                </p>
                                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                  <span>{video.viewCount?.toLocaleString() || 0} vistas</span>
                                  <span>•</span>
                                  <span>hace 2 días</span>
                                </div>
                              </div>
                            </div>
                          </NavigationLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
