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
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Comment {
  id: string
  author: string
  authorAvatar?: string
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
}

interface VideoInteractionsProps {
  videoId: string
  likes: number
  dislikes: number
  isLiked: boolean
  isDisliked: boolean
  isSaved: boolean
  rating: number
  userRating: number
  comments: Comment[]
  className?: string
}

export function VideoInteractions({
  videoId: _videoId,
  likes = 0,
  dislikes = 0,
  isLiked = false,
  isDisliked = false,
  isSaved = false,
  rating = 0,
  userRating = 0,
  comments = [],
  className = '',
}: VideoInteractionsProps) {
  const [liked, setLiked] = useState(isLiked)
  const [disliked, setDisliked] = useState(isDisliked)
  const [saved, setSaved] = useState(isSaved)
  const [currentUserRating, setCurrentUserRating] = useState(userRating)
  const [newComment, setNewComment] = useState('')
  const [localComments, setLocalComments] = useState<Comment[]>(comments)
  const { toast } = useToast()

  const handleLike = () => {
    setLiked(!liked)
    if (disliked) setDisliked(false)

    toast({
      title: liked ? 'Like removido' : 'Video liked',
      description: liked ? 'Has removido tu like' : 'Te gusta este video',
    })
  }

  const handleDislike = () => {
    setDisliked(!disliked)
    if (liked) setLiked(false)

    toast({
      title: disliked ? 'Dislike removido' : 'Video disliked',
      description: disliked ? 'Has removido tu dislike' : 'No te gusta este video',
    })
  }

  const handleSave = () => {
    setSaved(!saved)

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
    setCurrentUserRating(newRating)

    toast({
      title: 'Calificación enviada',
      description: `Has calificado este video con ${newRating} estrellas`,
    })
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) {
      toast({
        title: 'Comentario vacío',
        description: 'Escribe algo antes de comentar',
        variant: 'destructive',
      })
      return
    }

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Usuario Actual',
      content: newComment.trim(),
      timestamp: 'Ahora',
      likes: 0,
      isLiked: false,
    }

    setLocalComments([comment, ...localComments])
    setNewComment('')

    toast({
      title: 'Comentario publicado',
      description: 'Tu comentario se ha añadido al video',
    })
  }

  const handleCommentLike = (commentId: string) => {
    setLocalComments(
      localComments.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    )
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
        <CardContent className='p-4'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <Button
                variant={liked ? 'default' : 'outline'}
                size='sm'
                onClick={handleLike}
                className='flex items-center gap-2'
                aria-label={`${liked ? 'Quitar' : 'Dar'} like al video`}
              >
                <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                {formatNumber(likes + (liked && !isLiked ? 1 : 0) - (isLiked && !liked ? 1 : 0))}
              </Button>

              <Button
                variant={disliked ? 'destructive' : 'outline'}
                size='sm'
                onClick={handleDislike}
                className='flex items-center gap-2'
                aria-label={`${disliked ? 'Quitar' : 'Dar'} dislike al video`}
              >
                <ThumbsDown className={`h-4 w-4 ${disliked ? 'fill-current' : ''}`} />
                {formatNumber(
                  dislikes + (disliked && !isDisliked ? 1 : 0) - (isDisliked && !disliked ? 1 : 0)
                )}
              </Button>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant={saved ? 'default' : 'outline'}
                size='sm'
                onClick={handleSave}
                className='flex items-center gap-2'
                aria-label={`${saved ? 'Remover de' : 'Añadir a'} guardados`}
              >
                <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'Guardado' : 'Guardar'}
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={handleShare}
                className='flex items-center gap-2'
                aria-label='Compartir video'
              >
                <Share2 className='h-4 w-4' />
                Compartir
              </Button>

              <Button
                variant='outline'
                size='sm'
                className='flex items-center gap-2'
                aria-label='Reportar video'
              >
                <Flag className='h-4 w-4' />
                Reportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistema de calificación por estrellas */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Calificación</h3>
            <div className='flex items-center gap-2'>
              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
              <span className='font-medium'>{rating.toFixed(1)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <p className='text-sm text-muted-foreground'>
              Califica este video para ayudar a otros usuarios
            </p>
            <div className='flex items-center gap-1'>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className='transition-colors hover:scale-110 transform'
                  aria-label={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= currentUserRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            {currentUserRating > 0 && (
              <p className='text-sm text-green-600'>
                Has calificado este video con {currentUserRating} estrella
                {currentUserRating > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sección de comentarios */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold flex items-center gap-2'>
            <MessageCircle className='h-5 w-5' />
            Comentarios ({localComments.length})
          </h3>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Formulario para nuevo comentario */}
          <form onSubmit={handleCommentSubmit} className='space-y-3'>
            <Textarea
              placeholder='Escribe un comentario...'
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              rows={3}
              aria-label='Escribir comentario'
            />
            <div className='flex justify-end'>
              <Button
                type='submit'
                size='sm'
                disabled={!newComment.trim()}
                className='flex items-center gap-2'
              >
                <MessageCircle className='h-4 w-4' />
                Comentar
              </Button>
            </div>
          </form>

          <Separator />

          {/* Lista de comentarios */}
          <div className='space-y-4'>
            {localComments.length > 0 ? (
              localComments.map(comment => (
                <div key={comment.id} className='flex gap-3 p-3 bg-muted/30 rounded-lg'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={comment.authorAvatar} alt={comment.author} />
                    <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1 space-y-2'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-sm'>{comment.author}</span>
                      <span className='text-xs text-muted-foreground'>{comment.timestamp}</span>
                    </div>
                    <p className='text-sm'>{comment.content}</p>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleCommentLike(comment.id)}
                        className={`flex items-center gap-1 h-7 px-2 ${
                          comment.isLiked ? 'text-primary' : 'text-muted-foreground'
                        }`}
                        aria-label={`${comment.isLiked ? 'Quitar' : 'Dar'} like al comentario`}
                      >
                        <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                        {comment.likes > 0 && formatNumber(comment.likes)}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                <MessageCircle className='h-12 w-12 mx-auto mb-3 opacity-50' />
                <p>No hay comentarios aún</p>
                <p className='text-sm'>¡Sé el primero en comentar!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
