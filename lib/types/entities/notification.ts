// Comment interface moved to avoid conflicts
export interface VideoComment {
  id: string
  videoId: string
  authorId: string
  author: string
  authorAvatar?: string
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
  replies?: VideoComment[]
  parentId?: string
  // Additional fields for compatibility
  createdAt?: Date
  likeCount?: number
  userName?: string
  text?: string
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

export type NotificationType = 'new_video' | 'comment' | 'like' | 'follow' | 'system'
