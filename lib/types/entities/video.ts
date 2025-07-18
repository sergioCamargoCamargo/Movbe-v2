export interface Video {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  category: VideoCategory
  creatorId: string
  creator: VideoCreator
  viewCount: number
  likeCount: number
  dislikeCount: number
  rating?: number
  ratingCount?: number
  duration: string
  uploadedAt: Date | string
  isPublic: boolean
  tags: string[]
}

export interface FirestoreVideo {
  id: string
  title: string
  description: string
  thumbnailURL: string
  uploaderId: string
  uploaderName: string
  category: string
  tags: string[]
  commentCount: number
  visibility: 'public' | 'private' | 'unlisted'
  videoURLs: {
    original: string
  }
  dislikeCount: number
  language: string
  status: 'published' | 'processing' | 'draft'
  uploadDate: FirestoreTimestamp | string
  likeCount: number
  publishedAt: FirestoreTimestamp | string
  duration: number
  viewCount: number
  rating?: number
  ratingCount?: number
}

import { FirestoreTimestamp } from '../common/firebase'

export interface VideoCreator {
  id: string
  displayName: string
  avatar?: string
  verified: boolean
}

export type VideoCategory =
  | 'Música'
  | 'Videojuegos'
  | 'Noticias'
  | 'Educación'
  | 'Entretenimiento'
  | 'Deportes'
  | 'Tecnología'
  | 'Cocina'
  | 'Viajes'
  | 'Moda'
  | 'Ciencia'
  | 'Arte'
  | 'Comedia'
  | 'Documentales'
  | 'Otros'

export interface VideoInteraction {
  videoId: string
  userId: string
  liked: boolean
  disliked: boolean
  saved: boolean
  rating: number
  watchTime: number
  lastWatched: Date
}

export interface FilterOptions {
  category?: VideoCategory
  sortBy?: 'newest' | 'oldest' | 'most_viewed' | 'highest_rated'
  timeRange?: '24h' | '7d' | '30d' | '90d' | '1y' | 'all'
  searchQuery?: string
}

export interface UploadProgress {
  videoId: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}
