'use client'

import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Send } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Slider from 'react-slick'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'
import { 
  toggleVideoLike, 
  setComments, 
  addComment, 
  setLoadingComments, 
  toggleSubscription,
  updateVideoInteraction 
} from '@/lib/store/slices/videoSlice'
import { getVideoService, getCommentService, getSubscriptionService, getVideoInteractionService } from '@/lib/di/serviceRegistration'
import type { FirestoreVideo, Comment } from '@/types/video'

import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'

export default function WatchPage() {
  const { id } = useParams() as { id: string }
  const dispatch = useAppDispatch()
  const videoInteraction = useAppSelector(state => state.video.interactions[id])
  const currentUser = useAppSelector(state => state.auth.user)
  
  const [video, setVideo] = useState<FirestoreVideo | null>(null)
  const [recommendedVideos, setRecommendedVideos] = useState<FirestoreVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showComments, setShowComments] = useState(true)
  const lastScrollTop = useRef(0)
  const videoRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true)
        const videoService = getVideoService()
        const videoData = await videoService.getFirestoreVideoById(id)
        
        if (videoData) {
          setVideo(videoData)
          
          // Initialize video interaction state
          dispatch(updateVideoInteraction({
            videoId: id,
            updates: {
              videoId: id,
              liked: false,
              disliked: false,
              saved: false,
              subscribed: false,
              commentCount: videoData.commentCount || 0,
              likeCount: videoData.likeCount || 0,
              dislikeCount: videoData.dislikeCount || 0,
              viewCount: videoData.viewCount || 0,
              comments: [],
              loadingComments: false,
              likeStatus: null
            }
          }))
          
          // Increment view count
          if (currentUser?.uid) {
            const videoInteractionService = getVideoInteractionService()
            await videoInteractionService.incrementVideoViews(id, videoData.uploaderId)
          }

          // Load recommended videos
          const recommendedVideoList = await videoService.getPublicVideos(10)
          setRecommendedVideos(recommendedVideoList.filter(v => v.id !== id))
        }
      } catch (error) {
        console.error('Error loading video:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVideo()
  }, [id, dispatch, currentUser])

  useEffect(() => {
    const loadComments = async () => {
      if (!video) return
      
      try {
        dispatch(setLoadingComments({ videoId: id, loading: true }))
        const commentService = getCommentService()
        const commentsData = await commentService.getCommentsByVideoId(id)
        dispatch(setComments({ videoId: id, comments: commentsData }))
      } catch (error) {
        console.error('Error loading comments:', error)
      } finally {
        dispatch(setLoadingComments({ videoId: id, loading: false }))
      }
    }

    loadComments()
  }, [video, id, dispatch])

  useEffect(() => {
    const loadUserInteractions = async () => {
      if (!currentUser?.uid || !video) return
      
      try {
        const videoInteractionService = getVideoInteractionService()
        const subscriptionService = getSubscriptionService()
        
        // Load like status
        const likeStatus = await videoInteractionService.getUserVideoLikeStatus(id, currentUser.uid)
        
        // Load subscription status
        const subscribed = await subscriptionService.checkSubscription(currentUser.uid, video.uploaderId)
        
        dispatch(updateVideoInteraction({
          videoId: id,
          updates: {
            liked: likeStatus.liked,
            disliked: likeStatus.disliked,
            likeStatus: likeStatus.liked ? 'liked' : likeStatus.disliked ? 'disliked' : null,
            subscribed
          }
        }))
      } catch (error) {
        console.error('Error loading user interactions:', error)
      }
    }

    loadUserInteractions()
  }, [currentUser, video, id, dispatch])

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

  const handleLike = async () => {
    if (!currentUser?.uid || !video) return
    
    try {
      const videoInteractionService = getVideoInteractionService()
      const result = await videoInteractionService.toggleVideoLike(id, currentUser.uid, true)
      
      dispatch(toggleVideoLike({ videoId: id, isLike: true }))
      
      // Update counts based on result
      const updates: any = {}
      if (result.action === 'added') {
        updates.likeCount = (videoInteraction?.likeCount || 0) + 1
      } else if (result.action === 'removed') {
        updates.likeCount = Math.max(0, (videoInteraction?.likeCount || 0) - 1)
      } else if (result.action === 'changed') {
        updates.likeCount = (videoInteraction?.likeCount || 0) + 1
        updates.dislikeCount = Math.max(0, (videoInteraction?.dislikeCount || 0) - 1)
      }
      
      if (Object.keys(updates).length > 0) {
        dispatch(updateVideoInteraction({ videoId: id, updates }))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleDislike = async () => {
    if (!currentUser?.uid || !video) return
    
    try {
      const videoInteractionService = getVideoInteractionService()
      const result = await videoInteractionService.toggleVideoLike(id, currentUser.uid, false)
      
      dispatch(toggleVideoLike({ videoId: id, isLike: false }))
      
      // Update counts based on result
      const updates: any = {}
      if (result.action === 'added') {
        updates.dislikeCount = (videoInteraction?.dislikeCount || 0) + 1
      } else if (result.action === 'removed') {
        updates.dislikeCount = Math.max(0, (videoInteraction?.dislikeCount || 0) - 1)
      } else if (result.action === 'changed') {
        updates.dislikeCount = (videoInteraction?.dislikeCount || 0) + 1
        updates.likeCount = Math.max(0, (videoInteraction?.likeCount || 0) - 1)
      }
      
      if (Object.keys(updates).length > 0) {
        dispatch(updateVideoInteraction({ videoId: id, updates }))
      }
    } catch (error) {
      console.error('Error toggling dislike:', error)
    }
  }

  const handleSubscribe = async () => {
    if (!currentUser?.uid || !video) return
    
    try {
      const subscriptionService = getSubscriptionService()
      const isCurrentlySubscribed = videoInteraction?.subscribed || false
      
      if (isCurrentlySubscribed) {
        await subscriptionService.unsubscribeFromChannel(currentUser.uid, video.uploaderId)
      } else {
        await subscriptionService.subscribeToChannel(currentUser.uid, video.uploaderId)
      }
      
      dispatch(toggleSubscription({ videoId: id, subscribed: !isCurrentlySubscribed }))
    } catch (error) {
      console.error('Error toggling subscription:', error)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!currentUser?.uid) return
    
    try {
      const commentService = getCommentService()
      await commentService.toggleCommentLike(commentId, currentUser.uid)
      
      // Reload comments to get updated like counts
      const commentsData = await commentService.getCommentsByVideoId(id)
      dispatch(setComments({ videoId: id, comments: commentsData }))
    } catch (error) {
      console.error('Error toggling comment like:', error)
    }
  }

  const handleSubmitComment = async () => {
    if (!currentUser?.uid || !newComment.trim() || !video) return
    
    try {
      setSubmittingComment(true)
      const commentService = getCommentService()
      
      const comment = await commentService.addComment(
        id,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Usuario anónimo',
        newComment.trim()
      )
      
      dispatch(addComment({ videoId: id, comment }))
      setNewComment('')
      
      // Reload comments to get the complete list
      const commentsData = await commentService.getCommentsByVideoId(id)
      dispatch(setComments({ videoId: id, comments: commentsData }))
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmittingComment(false)
    }
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

  if (loading) {
    return (
      <div className='flex flex-col min-h-screen'>
        <Header visible={showHeader} onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <ScrollArea className='flex-1'>
            <div className='p-2 sm:p-4 space-y-4'>
              <div className='aspect-video bg-muted rounded-lg animate-pulse'></div>
              <div className='h-8 bg-muted rounded animate-pulse'></div>
              <div className='h-16 bg-muted rounded animate-pulse'></div>
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className='flex flex-col min-h-screen'>
        <Header visible={showHeader} onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <ScrollArea className='flex-1'>
            <div className='p-2 sm:p-4 text-center'>
              <h1 className='text-2xl font-bold mb-4'>Video no encontrado</h1>
              <p>El video que buscas no existe o fue eliminado.</p>
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Header visible={showHeader} onMenuClick={() => dispatch(toggleSidebar())} />
      <div className='flex flex-1 overflow-hidden pt-16'>
        <Sidebar />
        <ScrollArea className='flex-1'>
          <div className='p-2 sm:p-4 space-y-4'>
            <div className='relative' ref={videoRef}>
              <div className='aspect-video bg-black'>
                {video?.videoURLs?.original ? (
                  <video
                    controls
                    className='w-full h-full'
                    poster={video.thumbnailURL || undefined}
                  >
                    <source src={video.videoURLs.original} type='video/mp4' />
                    Tu navegador no soporta el elemento de video.
                  </video>
                ) : (
                  <Image
                    src={video?.thumbnailURL || `/placeholder.svg?text=${encodeURIComponent(video?.title || 'Video')}`}
                    alt={video?.title || `Video ${id}`}
                    layout='fill'
                    objectFit='contain'
                  />
                )}
              </div>
              {showRecommendations && recommendedVideos.length > 0 && (
                <div
                  ref={carouselRef}
                  className='absolute top-0 left-0 right-0 bg-background bg-opacity-80 backdrop-blur-sm p-4 transition-opacity duration-300'
                >
                  <h3 className='font-bold mb-2'>Videos recomendados</h3>
                  <Slider {...sliderSettings} className='carousel-3d'>
                    {recommendedVideos.map(recVideo => (
                      <div key={recVideo.id} className='px-2 carousel-item'>
                        <a href={`/watch/${recVideo.id}`} className='block'>
                          <div className='aspect-video bg-muted rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-110 hover:z-10'>
                            <Image
                              src={
                                recVideo.thumbnailURL ||
                                `/placeholder.svg?text=${encodeURIComponent(recVideo.title.substring(0, 20))}`
                              }
                              alt={recVideo.title}
                              width={320}
                              height={180}
                              className='object-cover'
                            />
                          </div>
                          <p className='text-sm font-semibold truncate mt-1'>{recVideo.title}</p>
                          <p className='text-xs text-muted-foreground'>{recVideo.uploaderName}</p>
                        </a>
                      </div>
                    ))}
                  </Slider>
                </div>
              )}
            </div>
            <div className='space-y-4'>
              <h1 className='text-lg sm:text-2xl font-bold'>{video?.title || `Título del Video ${id}`}</h1>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <div className='flex items-center space-x-2 sm:space-x-4'>
                  <Image
                    src='/placeholder.svg?text=Avatar'
                    alt='Avatar del canal'
                    width={40}
                    height={40}
                    className='rounded-full'
                  />
                  <div className='flex-1'>
                    <p className='font-semibold text-sm sm:text-base'>{video?.uploaderName || 'Nombre del Canal'}</p>
                    <p className='text-xs sm:text-sm text-muted-foreground'>Canal</p>
                  </div>
                  {currentUser && currentUser.uid !== video.uploaderId && (
                    <Button
                      size='sm'
                      className='sm:size-default'
                      variant={videoInteraction?.subscribed ? 'outline' : 'default'}
                      onClick={handleSubscribe}
                      disabled={!currentUser}
                    >
                      {videoInteraction?.subscribed ? '✅ Suscrito' : 'Suscribirse'}
                    </Button>
                  )}
                  {currentUser && currentUser.uid === video.uploaderId && (
                    <Button size='sm' className='sm:size-default' variant='outline' disabled>
                      Tu video
                    </Button>
                  )}
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  <Button
                    variant={videoInteraction?.liked ? 'default' : 'secondary'}
                    onClick={handleLike}
                    size='sm'
                    className='sm:size-default'
                    disabled={!currentUser}
                  >
                    <ThumbsUp className='mr-1 sm:mr-2 h-4 w-4' />
                    <span className='hidden xs:inline'>{(videoInteraction?.likeCount || 0).toLocaleString()}</span>
                  </Button>
                  <Button
                    variant={videoInteraction?.disliked ? 'default' : 'secondary'}
                    onClick={handleDislike}
                    size='sm'
                    className='sm:size-default'
                    disabled={!currentUser}
                  >
                    <ThumbsDown className='mr-1 sm:mr-2 h-4 w-4' />
                    <span className='hidden xs:inline'>{(videoInteraction?.dislikeCount || 0).toLocaleString()}</span>
                  </Button>
                  <Button variant='secondary' size='sm' className='sm:size-default'>
                    <Share2 className='mr-1 sm:mr-2 h-4 w-4' />
                    <span className='hidden sm:inline'>Compartir</span>
                  </Button>
                  <Button variant='secondary' size='sm' className='sm:size-default hidden sm:flex'>
                    <Download className='mr-2 h-4 w-4' /> Descargar
                  </Button>
                  <Button variant='secondary' size='sm' className='sm:size-default'>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='bg-muted p-3 sm:p-4 rounded-lg'>
                <p className='text-xs sm:text-sm'>
                  {(videoInteraction?.viewCount || video?.viewCount || 0).toLocaleString()} visualizaciones •{' '}
                  {video?.uploadDate ? new Date(video.uploadDate.seconds * 1000).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'hace 1 día'}
                </p>
                <p className='mt-2 text-sm sm:text-base'>
                  {video?.description || 'Sin descripción disponible.'}
                </p>
              </div>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-lg sm:text-xl font-bold'>
                    Comentarios ({videoInteraction?.commentCount || 0})
                  </h2>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setShowComments(!showComments)}
                  >
                    {showComments ? 'Ocultar' : 'Mostrar'} comentarios
                  </Button>
                </div>

                {showComments && currentUser && (
                  <div className='flex space-x-2 sm:space-x-4'>
                    <Image
                      src='/placeholder.svg?text=User'
                      alt='Tu avatar'
                      width={40}
                      height={40}
                      className='rounded-full'
                    />
                    <div className='flex-1 space-y-2'>
                      <Textarea
                        placeholder='Agrega un comentario...'
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className='min-h-[80px]'
                      />
                      <div className='flex justify-end space-x-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setNewComment('')}
                          disabled={!newComment.trim()}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size='sm'
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim() || submittingComment}
                        >
                          <Send className='mr-2 h-4 w-4' />
                          {submittingComment ? 'Enviando...' : 'Comentar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {!showComments && (
                  <div className='text-center p-4 bg-muted rounded-lg'>
                    <p className='text-muted-foreground'>
                      Haz clic en &quot;Mostrar comentarios&quot; para ver los{' '}
                      {videoInteraction?.commentCount || 0} comentarios
                    </p>
                  </div>
                )}

                {showComments && (
                  <div>
                    {videoInteraction?.loadingComments ? (
                      <div className='space-y-4'>
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className='flex space-x-2 sm:space-x-4'>
                            <div className='w-10 h-10 bg-muted rounded-full animate-pulse' />
                            <div className='flex-1 space-y-2'>
                              <div className='h-4 bg-muted rounded animate-pulse w-1/4' />
                              <div className='h-3 bg-muted rounded animate-pulse w-3/4' />
                              <div className='h-3 bg-muted rounded animate-pulse w-1/3' />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        {videoInteraction?.comments?.map((comment: Comment) => (
                          <div
                            key={comment.id}
                            className='flex space-x-2 sm:space-x-4 p-3 border rounded-lg'
                          >
                            <Image
                              src='/placeholder.svg?text=User'
                              alt='Avatar del usuario'
                              width={40}
                              height={40}
                              className='rounded-full'
                            />
                            <div className='flex-1'>
                              <div className='flex items-center space-x-2'>
                                <p className='font-semibold text-sm sm:text-base'>
                                  {comment.userName}
                                </p>
                                <span className='text-xs text-muted-foreground'>
                                  {comment.createdAt
                                    ? new Date(comment.createdAt).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'Ahora'}
                                </span>
                              </div>
                              <p className='text-xs sm:text-sm mt-1'>{comment.text}</p>
                              <div className='flex items-center space-x-1 sm:space-x-2 mt-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleCommentLike(comment.id)}
                                  disabled={!currentUser}
                                >
                                  <ThumbsUp className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
                                  {comment.likeCount || 0}
                                </Button>
                                <Button variant='ghost' size='sm' disabled={!currentUser}>
                                  <ThumbsDown className='h-3 w-3 sm:h-4 sm:w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='text-xs sm:text-sm'
                                  disabled={!currentUser}
                                >
                                  Responder
                                </Button>
                              </div>
                              
                              {comment.replies && comment.replies.length > 0 && (
                                <div className='ml-4 mt-3 space-y-3 border-l-2 border-muted pl-4'>
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id} className='flex space-x-2'>
                                      <Image
                                        src='/placeholder.svg?text=User'
                                        alt='Avatar del usuario'
                                        width={32}
                                        height={32}
                                        className='rounded-full'
                                      />
                                      <div className='flex-1'>
                                        <p className='font-semibold text-xs sm:text-sm'>{reply.userName}</p>
                                        <p className='text-xs text-muted-foreground'>
                                          {reply.createdAt.toLocaleDateString()}
                                        </p>
                                        <p className='text-xs mt-1'>{reply.text}</p>
                                        <div className='flex items-center space-x-1 mt-1'>
                                          <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => handleCommentLike(reply.id)}
                                            disabled={!currentUser}
                                          >
                                            <ThumbsUp className='h-3 w-3 mr-1' />
                                            {reply.likeCount || 0}
                                          </Button>
                                          <Button variant='ghost' size='sm' disabled={!currentUser}>
                                            <ThumbsDown className='h-3 w-3' />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )) || []}
                        
                        {(!videoInteraction?.comments || videoInteraction.comments.length === 0) && (
                          <div className='text-center p-4 bg-muted rounded-lg'>
                            <p className='text-muted-foreground'>
                              {currentUser ? 'Sé el primero en comentar' : 'Inicia sesión para ver y escribir comentarios'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}