import { 
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { FirestoreVideo } from '@/types/video'

export class VideoService {
  private readonly collectionName = 'videos'

  async getFirestoreVideoById(videoId: string): Promise<FirestoreVideo | null> {
    try {
      const videoDoc = await getDoc(doc(db, this.collectionName, videoId))
      
      if (!videoDoc.exists()) {
        return null
      }

      const data = videoDoc.data()
      return {
        id: videoDoc.id,
        ...data
      } as FirestoreVideo
    } catch (error) {
      console.error('Error fetching video by ID:', error)
      throw new Error('Failed to fetch video')
    }
  }

  async getPublicVideos(maxResults: number = 20): Promise<FirestoreVideo[]> {
    try {
      const videosQuery = query(
        collection(db, this.collectionName),
        where('visibility', '==', 'public'),
        where('status', '==', 'published'),
        orderBy('uploadDate', 'desc'),
        limit(maxResults)
      )

      const querySnapshot = await getDocs(videosQuery)
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      } as FirestoreVideo))
    } catch (error) {
      console.error('Error fetching public videos:', error)
      throw new Error('Failed to fetch videos')
    }
  }

  async getVideosByCategory(category: string, maxResults: number = 20): Promise<FirestoreVideo[]> {
    try {
      const videosQuery = query(
        collection(db, this.collectionName),
        where('visibility', '==', 'public'),
        where('status', '==', 'published'),
        where('category', '==', category),
        orderBy('uploadDate', 'desc'),
        limit(maxResults)
      )

      const querySnapshot = await getDocs(videosQuery)
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      } as FirestoreVideo))
    } catch (error) {
      console.error('Error fetching videos by category:', error)
      throw new Error('Failed to fetch videos by category')
    }
  }

  async getVideosByUploader(uploaderId: string, maxResults: number = 20): Promise<FirestoreVideo[]> {
    try {
      const videosQuery = query(
        collection(db, this.collectionName),
        where('uploaderId', '==', uploaderId),
        where('visibility', '==', 'public'),
        where('status', '==', 'published'),
        orderBy('uploadDate', 'desc'),
        limit(maxResults)
      )

      const querySnapshot = await getDocs(videosQuery)
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      } as FirestoreVideo))
    } catch (error) {
      console.error('Error fetching videos by uploader:', error)
      throw new Error('Failed to fetch videos by uploader')
    }
  }
}
