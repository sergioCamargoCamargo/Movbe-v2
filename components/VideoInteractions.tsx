'use client'

import {
  Heart,
  MessageCircle,
  Share2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Flag,
} from 'lucide-react'
import { useState, useEffect } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useVideoComments, useVideoLikes } from '@/lib/hooks/useVideoData'
import { VideoInteractionsProps } from '@/lib/interfaces/IVideoInteractions'
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import { updateVideoInteraction } from '@/lib/store/slices/videoSlice'

export function VideoInteractions({
  videoId,
  likes: _likes = 0,
  dislikes: _dislikes = 0,
  isLiked: _isLiked = false,
  isDisliked: _isDisliked = false,
  isSaved = false,
  rating = 0,
  userRating = 0,
  comments: _comments = [],
  className = '',
}: VideoInteractionsProps) {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const videoInteraction = useAppSelector(state => state.video.interactions[videoId])

  // Use optimized hooks for data management
  const {
    comments: localComments,
    loading: commentsLoading,
    addComment: addNewComment,
  } = useVideoComments(videoId)

  const {
    likeCount: hookLikeCount,
    dislikeCount: hookDislikeCount,
    isLiked: userLikeStatus_isLiked,
    isDisliked: userLikeStatus_isDisliked,
    loading: likesLoading,
    toggleLike,
  } = useVideoLikes(videoId)

  // Use hook data if available (from Redux cache), fallback to props
  const currentLikes = hookLikeCount || _likes
  const currentDislikes = hookDislikeCount || _dislikes

  // Use Redux state if available, otherwise use props
  const saved = videoInteraction?.saved ?? isSaved

  const [currentUserRating, setCurrentUserRating] = useState(userRating)
  const [newComment, setNewComment] = useState('')
  const { toast } = useToast()

  // Data is automatically loaded by hooks, no need for manual loading

  // Initialize video interaction in Redux if not exists
  useEffect(() => {
    if (!videoInteraction) {
      dispatch(
        updateVideoInteraction({
          videoId,
          updates: {
            liked: userLikeStatus_isLiked,
            saved: isSaved,
            commentCount: localComments.length,
            likeCount: currentLikes,
            dislikeCount: currentDislikes,
            viewCount: 0,
            userLikeStatus: {
              isLiked: userLikeStatus_isLiked,
              isDisliked: userLikeStatus_isDisliked,
            },
          },
        })
      )
    }
  }, [
    videoId,
    videoInteraction,
    dispatch,
    userLikeStatus_isLiked,
    userLikeStatus_isDisliked,
    isSaved,
    localComments.length,
    currentLikes,
    currentDislikes,
  ])

  const handleLike = async () => {
    if (!user) {
      toast({
        title: 'Inicia sesión requerido',
        description: 'Inicia sesión para dar like a los videos',
        variant: 'destructive',
      })
      return
    }

    const success = await toggleLike(true)
    if (success) {
      toast({
        title: userLikeStatus_isLiked ? 'Like removido' : 'Video liked',
        description: userLikeStatus_isLiked ? 'Has removido tu like' : 'Te gusta este video',
      })
    } else {
      toast({
        title: 'Error',
        description: 'Error al procesar el like',
        variant: 'destructive',
      })
    }
  }

  const handleDislike = async () => {
    if (!user) {
      toast({
        title: 'Inicia sesión requerido',
        description: 'Inicia sesión para dar dislike a los videos',
        variant: 'destructive',
      })
      return
    }

    const success = await toggleLike(false)
    if (success) {
      toast({
        title: 'Video feedback registrado',
        description: 'Tu reacción ha sido guardada',
      })
    } else {
      toast({
        title: 'Error',
        description: 'Error al procesar el dislike',
        variant: 'destructive',
      })
    }
  }

  const handleSave = () => {
    dispatch(
      updateVideoInteraction({
        videoId,
        updates: {
          saved: !saved,
        },
      })
    )

    toast({
      title: saved ? 'Removido de guardados' : 'Video guardado',
      description: saved
        ? 'El video se removió de tu lista'
        : 'Video añadido a tu lista de guardados',
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Video en MOBVE',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link copiado',
        description: 'El enlace del video se copió al portapapeles',
      })
    }
  }

  const handleRating = (newRating: number) => {
    if (!user) {
      toast({
        title: 'Inicia sesión requerido',
        description: 'Inicia sesión para calificar este video',
        variant: 'destructive',
      })
      return
    }

    setCurrentUserRating(newRating)

    toast({
      title: 'Calificación enviada',
      description: `Has calificado este video con ${newRating} estrellas`,
    })
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: 'Inicia sesión requerido',
        description: 'Inicia sesión para comentar en los videos',
        variant: 'destructive',
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: 'Comentario vacío',
        description: 'Escribe algo antes de comentar',
        variant: 'destructive',
      })
      return
    }

    const success = await addNewComment(newComment.trim())
    if (success) {
      setNewComment('')
      toast({
        title: 'Comentario publicado',
        description: 'Tu comentario se ha añadido al video',
      })
    } else {
      toast({
        title: 'Error',
        description: 'Error al publicar el comentario',
        variant: 'destructive',
      })
    }
  }

  const handleCommentLike = (_commentId: string) => {
    if (!user) {
      toast({
        title: 'Inicia sesión requerido',
        description: 'Inicia sesión para dar like a los comentarios',
        variant: 'destructive',
      })
      return
    }

    // Comment likes functionality would need to be implemented in Redux
    // For now, just show a toast
    toast({
      title: 'Función en desarrollo',
      description: 'Los likes de comentarios estarán disponibles pronto',
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Botones de interacción principales */}
      <Card>
        <CardContent className='p-2 sm:p-4'>
          {/* Mobile-first: Single row with scrollable buttons */}
          <div className='flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide'>
            <div className='flex items-center gap-2 flex-shrink-0'>
              <Button
                variant={user && userLikeStatus_isLiked ? 'default' : 'outline'}
                size='sm'
                onClick={handleLike}
                disabled={!user || likesLoading}
                className='flex items-center gap-1 sm:gap-2 touch-manipulation min-w-[60px] sm:min-w-[80px] h-9 sm:h-10'
                aria-label={
                  user
                    ? `${userLikeStatus_isLiked ? 'Quitar' : 'Dar'} like al video`
                    : 'Inicia sesión para dar like'
                }
                title={!user ? 'Inicia sesión para dar like' : ''}
              >
                <ThumbsUp
                  className={`h-4 w-4 ${user && userLikeStatus_isLiked ? 'fill-current' : ''}`}
                />
                <span className='text-xs sm:text-sm'>{formatNumber(currentLikes)}</span>
              </Button>

              <Button
                variant={user && userLikeStatus_isDisliked ? 'default' : 'outline'}
                size='sm'
                onClick={handleDislike}
                disabled={!user || likesLoading}
                className='flex items-center gap-1 sm:gap-2 touch-manipulation min-w-[60px] sm:min-w-[80px] h-9 sm:h-10'
                aria-label={
                  user ? 'Dar feedback negativo al video' : 'Inicia sesión para dar dislike'
                }
                title={!user ? 'Inicia sesión para dar dislike' : ''}
              >
                <ThumbsDown
                  className={`h-4 w-4 ${user && userLikeStatus_isDisliked ? 'fill-current' : ''}`}
                />
                <span className='text-xs sm:text-sm'>{formatNumber(currentDislikes)}</span>
              </Button>
            </div>

            <div className='flex items-center gap-2 flex-shrink-0'>
              <Button
                variant={saved ? 'default' : 'outline'}
                size='sm'
                onClick={handleSave}
                className='touch-manipulation flex items-center gap-1 sm:gap-2 h-9 sm:h-10'
                aria-label={`${saved ? 'Remover de' : 'Añadir a'} guardados`}
              >
                <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                <span className='hidden xs:inline text-xs sm:text-sm'>
                  {saved ? 'Guardado' : 'Guardar'}
                </span>
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={handleShare}
                className='flex items-center gap-1 sm:gap-2 touch-manipulation h-9 sm:h-10'
                aria-label='Compartir video'
              >
                <Share2 className='h-4 w-4' />
                <span className='hidden xs:inline text-xs sm:text-sm'>Compartir</span>
              </Button>

              <Button
                variant='outline'
                size='sm'
                className='flex items-center gap-1 sm:gap-2 touch-manipulation h-9 sm:h-10'
                aria-label='Reportar video'
              >
                <Flag className='h-4 w-4' />
                <span className='hidden sm:inline text-xs sm:text-sm'>Reportar</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistema de calificación por estrellas */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2'>
            <h3 className='text-base sm:text-lg font-semibold'>Calificación</h3>
            <div className='flex items-center gap-2'>
              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
              <span className='font-medium text-sm sm:text-base'>{rating.toFixed(1)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='space-y-3 sm:space-y-4'>
            <p className='text-xs sm:text-sm text-muted-foreground'>
              Califica este video para ayudar a otros usuarios
            </p>
            <div className='flex items-center justify-center sm:justify-start gap-1 sm:gap-2'>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  disabled={!user}
                  className={`transition-all duration-200 touch-manipulation p-1 ${
                    !user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
                  }`}
                  aria-label={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
                  title={!user ? 'Inicia sesión para calificar' : ''}
                >
                  <Star
                    className={`h-7 w-7 sm:h-8 sm:w-8 transition-colors ${
                      star <= currentUserRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : `text-gray-300 ${user ? 'hover:text-yellow-400' : ''}`
                    }`}
                  />
                </button>
              ))}
            </div>
            {currentUserRating > 0 && (
              <p className='text-xs sm:text-sm text-green-600 text-center sm:text-left'>
                Has calificado este video con {currentUserRating} estrella
                {currentUserRating > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sección de comentarios */}
      <Card>
        <CardHeader className='pb-3'>
          <h3 className='text-base sm:text-lg font-semibold flex items-center gap-2'>
            <MessageCircle className='h-4 w-4 sm:h-5 sm:w-5' />
            Comentarios ({localComments.length})
          </h3>
        </CardHeader>
        <CardContent className='space-y-3 sm:space-y-4'>
          {/* Formulario para nuevo comentario */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className='space-y-3'>
              <Textarea
                placeholder='Escribe un comentario...'
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={3}
                aria-label='Escribir comentario'
                className='resize-none touch-manipulation'
              />
              <div className='flex justify-end'>
                <Button
                  type='submit'
                  size='sm'
                  disabled={!newComment.trim()}
                  className='flex items-center gap-2 touch-manipulation h-9'
                >
                  <MessageCircle className='h-4 w-4' />
                  <span className='text-sm'>Comentar</span>
                </Button>
              </div>
            </form>
          ) : (
            <div className='p-3 sm:p-4 bg-muted/30 rounded-lg text-center'>
              <p className='text-sm text-muted-foreground'>
                <Button variant='link' className='p-0 h-auto font-normal text-sm'>
                  Inicia sesión
                </Button>{' '}
                para comentar en este video
              </p>
            </div>
          )}

          <Separator />

          {/* Lista de comentarios */}
          <div className='space-y-3 sm:space-y-4'>
            {commentsLoading ? (
              <div className='text-center py-6 sm:py-8'>
                <p className='text-sm sm:text-base'>Cargando comentarios...</p>
              </div>
            ) : localComments.length > 0 ? (
              localComments.map(comment => (
                <div key={comment.id} className='flex gap-2 sm:gap-3 p-3 bg-muted/30 rounded-lg'>
                  <Avatar className='h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0'>
                    <AvatarFallback className='text-xs sm:text-sm'>
                      {comment.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 space-y-2 min-w-0'>
                    <div className='flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2'>
                      <span className='font-semibold text-sm truncate'>{comment.userName}</span>
                      <span className='text-xs text-muted-foreground flex-shrink-0'>
                        {comment.createdAt &&
                        typeof comment.createdAt === 'object' &&
                        'toDate' in comment.createdAt
                          ? comment.createdAt.toDate().toLocaleDateString()
                          : 'Ahora'}
                      </span>
                    </div>
                    <p className='text-sm leading-relaxed break-words'>{comment.text}</p>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleCommentLike(comment.id)}
                        disabled={!user}
                        className={`flex items-center gap-1 h-7 px-2 text-muted-foreground touch-manipulation ${
                          !user ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        aria-label='Dar like al comentario'
                        title={!user ? 'Inicia sesión para dar like' : ''}
                      >
                        <Heart className='h-3 w-3' />
                        {comment.likeCount > 0 && (
                          <span className='text-xs'>{formatNumber(comment.likeCount)}</span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-6 sm:py-8 text-muted-foreground'>
                <MessageCircle className='h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50' />
                <p className='text-sm sm:text-base'>No hay comentarios aún</p>
                <p className='text-xs sm:text-sm'>¡Sé el primero en comentar!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
