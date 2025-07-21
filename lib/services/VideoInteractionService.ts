import { collection, doc, query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore'

import { db } from '../firebase/config'
import { FirebaseErrorHandler } from '../firebase/errors'
import { VideoRating, getFallbackTimestamp } from '../types'

export class VideoInteractionService {
  async getUserVideoRating(userId: string, videoId: string): Promise<VideoRating | null> {
    try {
      const q = query(
        collection(db, 'videoRatings'),
        where('userId', '==', userId),
        where('videoId', '==', videoId)
      )

      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        return { id: doc.id, ...doc.data() } as VideoRating
      }
      return null
    } catch (error) {
      console.error('Error getting rating:', FirebaseErrorHandler.handle(error).message)
      return null
    }
  }

  async rateVideo(userId: string, videoId: string, rating: number, isLike: boolean): Promise<void> {
    try {
      const existingRating = await this.getUserVideoRating(userId, videoId)

      const ratingData = {
        userId,
        videoId,
        rating,
        isLike,
        ratedAt: getFallbackTimestamp(),
      }

      if (existingRating) {
        const ratingRef = doc(db, 'videoRatings', existingRating.id)
        await updateDoc(ratingRef, ratingData)
      } else {
        await addDoc(collection(db, 'videoRatings'), ratingData)
      }
    } catch (error) {
      console.error('Error rating video:', FirebaseErrorHandler.handle(error).message)
    }
  }
}
