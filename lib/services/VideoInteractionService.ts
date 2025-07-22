import {
  collection,
  doc,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
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

  async toggleVideoLike(userId: string, videoId: string, isLike: boolean): Promise<boolean> {
    try {
      const existingLike = await this.getUserVideoLike(userId, videoId)
      const videoRef = doc(db, 'videos', videoId)

      if (existingLike) {
        const likeRef = doc(db, 'videoLikes', existingLike.id)

        if (existingLike.isLike === isLike) {
          // Remove like/dislike - delete the record entirely
          await deleteDoc(likeRef)
          await updateDoc(videoRef, {
            likeCount: isLike ? increment(-1) : increment(0),
            dislikeCount: isLike ? increment(0) : increment(-1),
          })
        } else {
          // Change from like to dislike or vice versa
          await updateDoc(likeRef, {
            isLike: isLike,
            likedAt: serverTimestamp(),
          })
          await updateDoc(videoRef, {
            likeCount: isLike ? increment(1) : increment(-1),
            dislikeCount: isLike ? increment(-1) : increment(1),
          })
        }
      } else {
        // Create new like/dislike
        const likesRef = collection(db, 'videoLikes')
        await addDoc(likesRef, {
          videoId,
          userId,
          isLike,
          likedAt: serverTimestamp(),
        })

        await updateDoc(videoRef, {
          likeCount: isLike ? increment(1) : increment(0),
          dislikeCount: isLike ? increment(0) : increment(1),
        })
      }

      return true
    } catch (error) {
      throw error
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

      // Calculate and update video's rating statistics
      await this.updateVideoRatingStats(videoId)
    } catch (error) {
      throw error
    }
  }

  private async updateVideoRatingStats(videoId: string): Promise<void> {
    try {
      // Get all ratings for this video
      const ratingsQuery = query(collection(db, 'videoRatings'), where('videoId', '==', videoId))

      const ratingsSnapshot = await getDocs(ratingsQuery)
      const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating as number)

      let averageRating = 0
      const ratingCount = ratings.length

      if (ratingCount > 0) {
        const totalRating = ratings.reduce((sum, rating) => sum + rating, 0)
        averageRating = totalRating / ratingCount
      }

      // Update video document with calculated stats
      const videoRef = doc(db, 'videos', videoId)
      await updateDoc(videoRef, {
        rating: averageRating,
        ratingCount: ratingCount,
        lastRatedAt: serverTimestamp(),
      })
    } catch (error) {
      throw error
    }
  }
}
