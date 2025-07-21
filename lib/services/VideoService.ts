import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  increment,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore'

import { db } from '../firebase/config'
import { FirebaseErrorHandler } from '../firebase/errors'
import { FirestoreVideo } from '../types/entities/video'

export class VideoService {
  private serializeTimestamps(data: DocumentData): DocumentData {
    const serialized = { ...data }

    if (data.uploadDate && typeof data.uploadDate === 'object' && 'seconds' in data.uploadDate) {
      serialized.uploadDate = {
        seconds: data.uploadDate.seconds,
        nanoseconds: data.uploadDate.nanoseconds,
      }
    }

    if (data.publishedAt && typeof data.publishedAt === 'object' && 'seconds' in data.publishedAt) {
      serialized.publishedAt = {
        seconds: data.publishedAt.seconds,
        nanoseconds: data.publishedAt.nanoseconds,
      }
    }

    return serialized
  }
  async getPublicVideos(limit?: number): Promise<FirestoreVideo[]> {
    try {
      const q = query(
        collection(db, 'videos'),
        where('visibility', '==', 'public'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const videos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.serializeTimestamps(doc.data()),
      })) as FirestoreVideo[]

      return limit ? videos.slice(0, limit) : videos
    } catch (error) {
      console.error('Error getting public videos:', FirebaseErrorHandler.handle(error).message)
      return []
    }
  }

  async getVideoById(videoId: string): Promise<FirestoreVideo | null> {
    try {
      const videoRef = doc(db, 'videos', videoId)
      const videoSnap = await getDoc(videoRef)

      if (videoSnap.exists()) {
        return { id: videoSnap.id, ...this.serializeTimestamps(videoSnap.data()) } as FirestoreVideo
      }
      return null
    } catch (error) {
      console.error('Error getting video:', FirebaseErrorHandler.handle(error).message)
      return null
    }
  }

  async getVideosByUser(userId: string): Promise<FirestoreVideo[]> {
    try {
      const q = query(
        collection(db, 'videos'),
        where('uploaderId', '==', userId),
        orderBy('uploadDate', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.serializeTimestamps(doc.data()),
      })) as FirestoreVideo[]
    } catch (error) {
      console.error('Error getting user videos:', FirebaseErrorHandler.handle(error).message)
      return []
    }
  }

  async searchVideos(searchQuery: string, limit = 20): Promise<FirestoreVideo[]> {
    try {
      const q = query(
        collection(db, 'videos'),
        where('visibility', '==', 'public'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const videos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.serializeTimestamps(doc.data()),
      })) as FirestoreVideo[]

      return videos
        .filter(
          video =>
            video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, limit)
    } catch (error) {
      console.error('Error searching videos:', FirebaseErrorHandler.handle(error).message)
      return []
    }
  }

  async updateVideo(videoId: string, updates: Partial<FirestoreVideo>): Promise<boolean> {
    try {
      const videoRef = doc(db, 'videos', videoId)
      await updateDoc(videoRef, updates as DocumentData)
      return true
    } catch (error) {
      console.error('Error updating video:', FirebaseErrorHandler.handle(error).message)
      return false
    }
  }

  async recordVideoView(videoId: string, userId?: string): Promise<void> {
    try {
      const viewData = {
        videoId,
        userId: userId || null,
        viewedAt: serverTimestamp(),
      }

      await addDoc(collection(db, 'videoViews'), viewData)

      const videoRef = doc(db, 'videos', videoId)
      await updateDoc(videoRef, {
        viewCount: increment(1),
      })
    } catch (error) {
      console.error('Error recording view:', FirebaseErrorHandler.handle(error).message)
    }
  }
}

// Re-export the correct type
export type { FirestoreVideo as Video } from '../types/entities/video'
