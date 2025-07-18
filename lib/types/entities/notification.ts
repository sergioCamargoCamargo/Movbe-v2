// This VideoComment interface is kept for legacy compatibility
// New code should use the Comment interface from comment.ts
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
