import { FirestoreTimestamp } from '../common/firebase'

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
}
