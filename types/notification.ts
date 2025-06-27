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
