import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../firebase/config'
import { Comment } from '../types'

export class CommentService {
  async getVideoComments(videoId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, 'comments'),
        where('videoId', '==', videoId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[]
    } catch {
      // Error handling - service will return empty array
      return []
    }
  }

  async addComment(commentData: {
    videoId: string
    userId: string
    userName: string
    text: string
  }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'comments'), {
        ...commentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return docRef.id
    } catch (_error) {
      // Error handling - throw error to be handled by caller
      throw _error
    }
  }
}
