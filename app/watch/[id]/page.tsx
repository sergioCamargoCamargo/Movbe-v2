'use client'

import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Send } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Slider from 'react-slick'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { getVideoById, toggleVideoLike, incrementVideoViews, getPublicVideos, subscribeToChannel, unsubscribeFromChannel, checkSubscription } from '@/lib/firestore'

import Header from '../../components/Header'

interface Video {
  id: string
  title: string
  description: string
  uploaderId: string
  uploaderName: string
  videoURLs: { original: string }
  thumbnailURL: string | null
  viewCount: number
  likeCount: number
  dislikeCount: number
  commentCount: number
  duration: number
  category: string
  tags: string[]
  language: string
  status: string
  visibility: string
  uploadDate: { seconds: number }
  publishedAt: { seconds: number } | null
}

interface Comment {
  id: number
  user: string
  text: string
  likes: number
}

export default function WatchPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [video, setVideo] = useState<Video | null>(null)
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const [userLiked, setUserLiked] = useState(false)
  const [userDisliked, setUserDisliked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: 'Usuario Demo', text: 'Excelente video! Me gustó mucho el contenido.', likes: 12 },
    { id: 2, user: 'Ana García', text: '¡Muy informativo! Esperando la siguiente parte.', likes: 8 },
    { id: 3, user: 'Carlos Ruiz', text: 'Gran trabajo, sigue así.', likes: 5 }
  ])
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const lastScrollTop = useRef(0)
  const videoRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id || typeof id !== 'string') {
        return
      }
      
      try {
        setLoading(true)
        const videoData = await getVideoById(id)
        
        if (videoData) {
          setVideo(videoData)
          // Incrementar vistas
          await incrementVideoViews(id, videoData.uploaderId)
          
          // Verificar suscripción si el usuario está logueado y no es su propio video
          if (user && user.uid !== videoData.uploaderId) {
            const subscribed = await checkSubscription(user.uid, videoData.uploaderId)
            setIsSubscribed(subscribed)
          }
          
          // Cargar videos recomendados
          const recommended = await getPublicVideos(10)
          setRecommendedVideos(recommended.filter(v => v.id !== id))
        } else {
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [id, user])

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
    if (!user || !video) {
      return
    }
    
    try {
      
      if (userDisliked) {
        setUserDisliked(false)
        setVideo(prev => prev ? { ...prev, dislikeCount: Math.max(0, prev.dislikeCount - 1) } : null)
      }
      
      if (!userLiked) {
        await toggleVideoLike(video.id, user.uid, true)
        setVideo(prev => prev ? { ...prev, likeCount: prev.likeCount + 1 } : null)
        setUserLiked(true)
      } else {
        // Toggle off like
        setVideo(prev => prev ? { ...prev, likeCount: Math.max(0, prev.likeCount - 1) } : null)
        setUserLiked(false)
      }
    } catch {
    }
  }

  const handleDislike = async () => {
    if (!user || !video) {
      return
    }
    
    try {
      
      if (userLiked) {
        setUserLiked(false)
        setVideo(prev => prev ? { ...prev, likeCount: Math.max(0, prev.likeCount - 1) } : null)
      }
      
      if (!userDisliked) {
        await toggleVideoLike(video.id, user.uid, false)
        setVideo(prev => prev ? { ...prev, dislikeCount: prev.dislikeCount + 1 } : null)
        setUserDisliked(true)
      } else {
        // Toggle off dislike
        setVideo(prev => prev ? { ...prev, dislikeCount: Math.max(0, prev.dislikeCount - 1) } : null)
        setUserDisliked(false)
      }
    } catch {
    }
  }

  const handleCommentLike = (commentId: number) => {
    setComments(prev =>
      prev.map(comment => (comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment))
    )
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return
    
    const comment = {
      id: Date.now(),
      user: user.displayName || user.email || 'Usuario',
      text: newComment.trim(),
      likes: 0
    }
    
    setComments(prev => [comment, ...prev])
    setNewComment('')
  }

  const handleSubscribe = async () => {
    if (!user || !video || subscribing) return
    
    if (user.uid === video.uploaderId) {
      return
    }
    
    try {
      setSubscribing(true)
      
      if (isSubscribed) {
        await unsubscribeFromChannel(user.uid, video.uploaderId)
        setIsSubscribed(false)
      } else {
        await subscribeToChannel(user.uid, video.uploaderId)
        setIsSubscribed(true)
      }
    } catch {
    } finally {
      setSubscribing(false)
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
      <div className='flex flex-col min-h-screen pt-16'>
        <Header visible={showHeader} />
        <ScrollArea className='flex-1'>
          <div className='p-2 sm:p-4 space-y-4'>
            <div className='aspect-video bg-muted rounded-lg animate-pulse'></div>
            <div className='h-8 bg-muted rounded animate-pulse'></div>
            <div className='h-16 bg-muted rounded animate-pulse'></div>
          </div>
        </ScrollArea>
      </div>
    )
  }

  if (!video) {
    return (
      <div className='flex flex-col min-h-screen pt-16'>
        <Header visible={showHeader} />
        <ScrollArea className='flex-1'>
          <div className='p-2 sm:p-4 text-center'>
            <h1 className='text-2xl font-bold mb-4'>Video no encontrado</h1>
            <p>El video que buscas no existe o fue eliminado.</p>
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className='flex flex-col min-h-screen pt-16'>
      <Header visible={showHeader} />
      <ScrollArea className='flex-1'>
        <div className='p-2 sm:p-4 space-y-4'>
          <div className='relative' ref={videoRef}>
            <div className='aspect-video bg-black'>
              {video.videoURLs?.original ? (
                <video
                  src={video.videoURLs.original}
                  controls
                  className='w-full h-full'
                  poster={video.thumbnailURL || undefined}
                >
                  Tu navegador no soporta el elemento video.
                </video>
              ) : (
                <Image
                  src={video.thumbnailURL || `/placeholder.svg?text=${encodeURIComponent(video.title)}`}
                  alt={video.title}
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
                  {recommendedVideos.map((recVideo) => (
                    <div key={recVideo.id} className='px-2 carousel-item'>
                      <a href={`/watch/${recVideo.id}`} className='block'>
                        <div className='aspect-video bg-muted rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-110 hover:z-10'>
                          <Image
                            src={recVideo.thumbnailURL || `/placeholder.svg?text=${encodeURIComponent(recVideo.title.substring(0, 20))}`}
                            alt={recVideo.title}
                            width={320}
                            height={180}
                            className='object-cover'
                          />
                        </div>
                        <p className='text-sm font-semibold truncate mt-1'>
                          {recVideo.title}
                        </p>
                        <p className='text-xs text-muted-foreground'>{recVideo.uploaderName}</p>
                      </a>
                    </div>
                  ))}
                </Slider>
              </div>
            )}
          </div>
          <div className='space-y-4'>
            <h1 className='text-lg sm:text-2xl font-bold'>{video.title}</h1>
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
                  <p className='font-semibold text-sm sm:text-base'>{video.uploaderName}</p>
                  <p className='text-xs sm:text-sm text-muted-foreground'>Canal</p>
                </div>
                {user && user.uid !== video.uploaderId && (
                  <Button 
                    size='sm' 
                    className='sm:size-default'
                    variant={isSubscribed ? 'secondary' : 'default'}
                    onClick={handleSubscribe}
                    disabled={subscribing}
                  >
                    {subscribing ? '⏳' : isSubscribed ? '✅ Suscrito' : 'Suscribirse'}
                  </Button>
                )}
                {user && user.uid === video.uploaderId && (
                  <Button size='sm' className='sm:size-default' variant='outline' disabled>
                    Tu video
                  </Button>
                )}
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  variant={userLiked ? 'default' : 'secondary'}
                  onClick={handleLike}
                  size='sm'
                  className='sm:size-default'
                  disabled={!user}
                >
                  <ThumbsUp className='mr-1 sm:mr-2 h-4 w-4' />
                  <span className='hidden xs:inline'>{video.likeCount.toLocaleString()}</span>
                </Button>
                <Button
                  variant={userDisliked ? 'default' : 'secondary'}
                  onClick={handleDislike}
                  size='sm'
                  className='sm:size-default'
                  disabled={!user}
                >
                  <ThumbsDown className='mr-1 sm:mr-2 h-4 w-4' />
                  <span className='hidden xs:inline'>{video.dislikeCount.toLocaleString()}</span>
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
                {video.viewCount.toLocaleString()} visualizaciones • {' '}
                {new Date(video.uploadDate.seconds * 1000).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className='mt-2 text-sm sm:text-base'>
                {video.description || 'Sin descripción disponible.'}
              </p>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg sm:text-xl font-bold'>
                  Comentarios ({comments.length})
                </h2>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowComments(!showComments)}
                >
                  {showComments ? 'Ocultar' : 'Mostrar'} comentarios
                </Button>
              </div>
              
              {showComments && user && (
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
                      >
                        Cancelar
                      </Button>
                      <Button
                        size='sm'
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        <Send className='mr-2 h-4 w-4' />
                        Comentar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {!showComments && (
                <div className='text-center p-4 bg-muted rounded-lg'>
                  <p className='text-muted-foreground'>
                    Haz clic en &quot;Mostrar comentarios&quot; para ver los {comments.length} comentarios
                  </p>
                </div>
              )}
              
              {showComments && comments.map(comment => (
                <div key={comment.id} className='flex space-x-2 sm:space-x-4'>
                  <Image
                    src='/placeholder.svg?text=User'
                    alt='Avatar del usuario'
                    width={40}
                    height={40}
                    className='rounded-full'
                  />
                  <div className='flex-1'>
                    <p className='font-semibold text-sm sm:text-base'>{comment.user}</p>
                    <p className='text-xs sm:text-sm'>{comment.text}</p>
                    <div className='flex items-center space-x-1 sm:space-x-2 mt-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleCommentLike(comment.id)}
                        disabled={!user}
                      >
                        <ThumbsUp className='h-3 w-3 sm:h-4 sm:w-4 mr-1' /> {comment.likes}
                      </Button>
                      <Button variant='ghost' size='sm' disabled={!user}>
                        <ThumbsDown className='h-3 w-3 sm:h-4 sm:w-4' />
                      </Button>
                      <Button variant='ghost' size='sm' className='text-xs sm:text-sm' disabled={!user}>
                        Responder
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
