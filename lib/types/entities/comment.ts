import { FirestoreTimestamp } from './category'

// Comment interface matching Firebase structure
export interface Comment {
  id: string
  videoId: string
  userId: string
  userName: string
  text: string
  createdAt: FirestoreTimestamp
  likeCount: number
  replies: Comment[]
  // Optional fields for compatibility
  author?: string
  authorId?: string
  authorAvatar?: string
  content?: string
  timestamp?: string
  likes?: number
  isLiked?: boolean
  parentId?: string
}
