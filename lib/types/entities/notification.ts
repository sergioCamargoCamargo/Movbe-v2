// VideoComment interface removed - only Comment interface is used
// The comments collection structure matches the Comment interface in comment.ts

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
