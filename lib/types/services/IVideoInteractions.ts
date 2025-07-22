/**
 * Interfaces para las interacciones de video (comentarios, likes, vistas)
 * Estas interfaces definen la estructura de datos para las colecciones de Firebase
 */

import { Timestamp } from 'firebase/firestore'

import { Comment } from '../entities/comment'

/**
 * Interfaz para comentarios de video se movió a entities/comment.ts
 */

/**
 * Interfaz para likes/dislikes de video
 * Corresponde a la colección 'videoLikes' en Firebase
 */
export interface VideoLike {
  id: string
  videoId: string
  userId: string
  isLike: boolean // true = like, false = dislike
  likedAt: Timestamp | Date
}

/**
 * Interfaz para las vistas de video
 * Corresponde a la colección 'videoViews' en Firebase
 */
export interface VideoView {
  id: string
  videoId: string
  userId: string
  viewedAt: Timestamp | Date
}

/**
 * Interfaz para las calificaciones de video
 * Corresponde a la colección 'videoRatings' en Firebase
 */
export interface VideoRating {
  id: string
  videoId: string
  userId: string
  rating: number // 1-5 stars
  ratedAt: Timestamp | Date
}

/**
 * Interfaz para el componente VideoInteractions
 */
export interface VideoInteractionsProps {
  videoId: string
  likes: number
  dislikes: number
  isLiked: boolean
  isDisliked: boolean
  isSaved: boolean
  rating: number
  ratingCount?: number
  userRating: number
  comments: Comment[]
  className?: string
}

/**
 * Interfaz para el estado local de likes del usuario
 */
export interface UserLikeStatus {
  isLiked: boolean
  isDisliked: boolean
}
