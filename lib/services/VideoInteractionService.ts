import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  increment,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { VideoLikeStatus } from '@/types/video'

interface LikeActionResult {
  action: 'added' | 'removed' | 'changed'
  liked: boolean
  disliked: boolean
}

export class VideoInteractionService {
  private readonly likesCollection = 'videoLikes'
  private readonly videosCollection = 'videos'
  private readonly viewsCollection = 'videoViews'

  async getUserVideoLikeStatus(videoId: string, userId: string): Promise<VideoLikeStatus> {
    try {
      const likeDoc = await getDoc(doc(db, this.likesCollection, `${videoId}_${userId}`))
      
      if (!likeDoc.exists()) {
        return { liked: false, disliked: false }
      }

      const data = likeDoc.data()
      return {
        liked: data.liked || false,
        disliked: data.disliked || false
      }
    } catch (error) {
      console.error('Error getting like status:', error)
      return { liked: false, disliked: false }
    }
  }

  async toggleVideoLike(videoId: string, userId: string, isLike: boolean): Promise<LikeActionResult> {
    try {
      const likeDocId = `${videoId}_${userId}`
      const likeDocRef = doc(db, this.likesCollection, likeDocId)
      const likeDoc = await getDoc(likeDocRef)
      
      const videoDocRef = doc(db, this.videosCollection, videoId)
      
      let action: 'added' | 'removed' | 'changed'
      let newLiked = false
      let newDisliked = false
      
      if (!likeDoc.exists()) {
        // No previous interaction - add new like/dislike
        const likeData = {
          videoId,
          userId,
          liked: isLike,
          disliked: !isLike,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        
        await setDoc(likeDocRef, likeData)
        
        // Update video counts
        if (isLike) {
          await updateDoc(videoDocRef, { likeCount: increment(1) })
        } else {
          await updateDoc(videoDocRef, { dislikeCount: increment(1) })
        }
        
        action = 'added'
        newLiked = isLike
        newDisliked = !isLike
      } else {
        const currentData = likeDoc.data()
        const currentLiked = currentData.liked || false
        const currentDisliked = currentData.disliked || false
        
        if ((isLike && currentLiked) || (!isLike && currentDisliked)) {
          // Same action - remove the like/dislike
          await deleteDoc(likeDocRef)
          
          // Update video counts
          if (isLike) {
            await updateDoc(videoDocRef, { likeCount: increment(-1) })
          } else {
            await updateDoc(videoDocRef, { dislikeCount: increment(-1) })
          }
          
          action = 'removed'
          newLiked = false
          newDisliked = false
        } else {
          // Different action - change from like to dislike or vice versa
          const likeData = {
            videoId,
            userId,
            liked: isLike,
            disliked: !isLike,
            updatedAt: serverTimestamp()
          }
          
          await updateDoc(likeDocRef, likeData)
          
          // Update video counts
          if (isLike) {
            await updateDoc(videoDocRef, { 
              likeCount: increment(1),
              dislikeCount: increment(-1)
            })
          } else {
            await updateDoc(videoDocRef, { 
              likeCount: increment(-1),
              dislikeCount: increment(1)
            })
          }
          
          action = 'changed'
          newLiked = isLike
          newDisliked = !isLike
        }
      }
      
      return {
        action,
        liked: newLiked,
        disliked: newDisliked
      }
    } catch (error) {
      console.error('Error toggling video like:', error)
      throw new Error('Failed to toggle video like')
    }
  }

  async incrementVideoViews(videoId: string, uploaderId?: string): Promise<void> {
    try {
      const videoDocRef = doc(db, this.videosCollection, videoId)
      
      // Increment view count
      await updateDoc(videoDocRef, {
        viewCount: increment(1)
      })
      
      // Optionally track individual view records
      const viewData = {
        videoId,
        uploaderId,
        viewedAt: serverTimestamp()
      }
      
      await setDoc(doc(collection(db, this.viewsCollection)), viewData)
    } catch (error) {
      console.error('Error incrementing video views:', error)
      // Don't throw error for view tracking failures
    }
  }

  async getUserLikedVideos(userId: string): Promise<string[]> {
    try {
      const likesQuery = query(
        collection(db, this.likesCollection),
        where('userId', '==', userId),
        where('liked', '==', true)
      )
      
      const querySnapshot = await getDocs(likesQuery)
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => 
        doc.data().videoId
      )
    } catch (error) {
      console.error('Error fetching user liked videos:', error)
      return []
    }
  }

  async getVideoLikeCount(videoId: string): Promise<{ likeCount: number; dislikeCount: number }> {
    try {
      const videoDoc = await getDoc(doc(db, this.videosCollection, videoId))
      
      if (!videoDoc.exists()) {
        return { likeCount: 0, dislikeCount: 0 }
      }
      
      const data = videoDoc.data()
      return {
        likeCount: data.likeCount || 0,
        dislikeCount: data.dislikeCount || 0
      }
    } catch (error) {
      console.error('Error getting video like count:', error)
      return { likeCount: 0, dislikeCount: 0 }
    }
  }
}
