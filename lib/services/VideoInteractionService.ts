import {
  collection,
  doc,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../firebase/config'
import { VideoLike, VideoRating } from '../types/services/IVideoInteractions'

export class VideoInteractionService {
  async getUserVideoLike(userId: string, videoId: string): Promise<VideoLike | null> {
    try {
      const q = query(
        collection(db, 'videoLikes'),
        where('userId', '==', userId),
        where('videoId', '==', videoId)
      )

      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        return { id: doc.id, ...doc.data() } as VideoLike
      }
      return null
    } catch {
      // Error handling - return null on failure
      return null
    }
  }

  async toggleVideoLike(userId: string, videoId: string, isLike: boolean): Promise<void> {
    try {
      const existingLike = await this.getUserVideoLike(userId, videoId)

      const likeData = {
        userId,
        videoId,
        isLike,
        likedAt: serverTimestamp(),
      }

      if (existingLike) {
        const likeRef = doc(db, 'videoLikes', existingLike.id)
        await updateDoc(likeRef, likeData)
      } else {
        await addDoc(collection(db, 'videoLikes'), likeData)
      }
    } catch {
      // Error handling - operation failed silently
    }
  }

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
    } catch {
      // Error handling - return null on failure
      return null
    }
  }

  async rateVideo(userId: string, videoId: string, rating: number): Promise<void> {
    try {
      const existingRating = await this.getUserVideoRating(userId, videoId)

      const ratingData = {
        userId,
        videoId,
        rating,
        ratedAt: serverTimestamp(),
      }

      if (existingRating) {
        const ratingRef = doc(db, 'videoRatings', existingRating.id)
        await updateDoc(ratingRef, ratingData)
      } else {
        await addDoc(collection(db, 'videoRatings'), ratingData)
      }
    } catch {
      // Error handling - operation failed silently
    }
  }
}
