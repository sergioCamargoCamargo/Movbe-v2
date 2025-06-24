export interface User {
  id: string
  email: string
  displayName: string
  avatar?: string
  type: UserType
  createdAt: Date
  updatedAt: Date
}

export type UserType = 'normal' | 'creator' | 'business' | 'admin'

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
  rating: number
  duration: string
  uploadedAt: Date
  isPublic: boolean
  tags: string[]
}

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

export interface Comment {
  id: string
  videoId: string
  authorId: string
  author: string
  authorAvatar?: string
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
  parentId?: string
}

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

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: Date
  actionUrl?: string
}

export type NotificationType = 
  | 'new_video' 
  | 'comment' 
  | 'like' 
  | 'follow' 
  | 'system'

export interface UserSettings {
  userId: string
  notifications: NotificationSettings
  privacy: PrivacySettings
  display: DisplaySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  newVideos: boolean
  comments: boolean
  likes: boolean
  followers: boolean
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private'
  showEmail: boolean
  showActivity: boolean
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  autoplay: boolean
  quality: 'auto' | '480p' | '720p' | '1080p'
}

export interface Analytics {
  userId: string
  totalViews: number
  totalVideos: number
  totalSubscribers: number
  averageWatchTime: number
  topVideos: TopVideo[]
  viewHistory: ViewData[]
  demographics: Demographics
}

export interface TopVideo {
  id: string
  title: string
  views: number
  duration: string
  uploadDate: Date
}

export interface ViewData {
  date: string
  views: number
  users: number
  watchTime: number
}

export interface Demographics {
  ageGroups: AgeGroup[]
  locations: Location[]
  devices: Device[]
}

export interface AgeGroup {
  range: string
  percentage: number
  count: number
}

export interface Location {
  country: string
  percentage: number
  count: number
}

export interface Device {
  type: 'mobile' | 'desktop' | 'tablet'
  percentage: number
  count: number
}

export interface Advertisement {
  id: string
  title: string
  description: string
  imageUrl: string
  ctaText: string
  sponsor: string
  type: AdType
  size: AdSize
  targetAudience?: string[]
  isActive: boolean
  clickCount: number
  impressionCount: number
}

export type AdType = 'banner' | 'video' | 'interactive' | 'watermark'
export type AdSize = 'small' | 'medium' | 'large' | 'fullwidth'

export interface ContactForm {
  name: string
  email: string
  userType: UserType
  subject: string
  message: string
  submittedAt: Date
  status: 'pending' | 'in_progress' | 'resolved'
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
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