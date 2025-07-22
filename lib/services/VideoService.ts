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
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

import { db } from '../firebase/config'
import { FirestoreVideo } from '../types/entities/video'
import { VideoUploadData, VideoUploadProgress } from '../types/services/IVideoService'
import { serializeTimestamps } from '../utils'

const storage = getStorage()

export class VideoService {
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
        ...serializeTimestamps(doc.data()),
      })) as FirestoreVideo[]

      return limit ? videos.slice(0, limit) : videos
    } catch {
      // Error handling - return empty array
      return []
    }
  }

  async getVideoById(videoId: string): Promise<FirestoreVideo | null> {
    try {
      const videoRef = doc(db, 'videos', videoId)
      const videoSnap = await getDoc(videoRef)

      if (videoSnap.exists()) {
        return { id: videoSnap.id, ...serializeTimestamps(videoSnap.data()) } as FirestoreVideo
      }
      return null
    } catch {
      // Error handling - return null if video not found
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
        ...serializeTimestamps(doc.data()),
      })) as FirestoreVideo[]
    } catch {
      // Error handling - return empty array
      return []
    }
  }

  async searchVideos(searchQuery: string, limit = 20): Promise<FirestoreVideo[]> {
    try {
      // Note: Firestore doesn't support full-text search natively.
      // For production, consider using Algolia or similar search service.
      // For now, we optimize by searching in title field using array-contains for tags
      const searchLower = searchQuery.toLowerCase()

      // Try to search by tags first (more efficient when tags match)
      const tagQuery = query(
        collection(db, 'videos'),
        where('visibility', '==', 'public'),
        where('status', '==', 'published'),
        where('tags', 'array-contains', searchQuery),
        orderBy('publishedAt', 'desc')
      )

      let videos: FirestoreVideo[] = []

      try {
        const tagSnapshot = await getDocs(tagQuery)
        videos = tagSnapshot.docs.map(doc => ({
          id: doc.id,
          ...serializeTimestamps(doc.data()),
        })) as FirestoreVideo[]

        if (videos.length >= limit) {
          return videos.slice(0, limit)
        }
      } catch {
        // Tag search might fail if no exact tag matches, continue with full search
      }

      // If tag search didn't return enough results, do a broader search
      // This is still inefficient but necessary given Firestore limitations
      const broadQuery = query(
        collection(db, 'videos'),
        where('visibility', '==', 'public'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
      )

      const snapshot = await getDocs(broadQuery)
      const allVideos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...serializeTimestamps(doc.data()),
      })) as FirestoreVideo[]

      const filteredVideos = allVideos.filter(
        video =>
          video.title.toLowerCase().includes(searchLower) ||
          video.description.toLowerCase().includes(searchLower) ||
          video.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )

      // Combine and deduplicate results
      const combined = [...videos, ...filteredVideos]
      const unique = combined.filter(
        (video, index, self) => index === self.findIndex(v => v.id === video.id)
      )

      return unique.slice(0, limit)
    } catch {
      // Error handling - return empty array
      return []
    }
  }

  async updateVideo(videoId: string, updates: Partial<FirestoreVideo>): Promise<boolean> {
    try {
      const videoRef = doc(db, 'videos', videoId)
      await updateDoc(videoRef, updates as DocumentData)
      return true
    } catch (_error) {
      // Error handling - throw error to caller
      throw _error
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
    } catch {
      // Error handling - view count update failed silently
    }
  }

  async uploadVideo(
    videoData: VideoUploadData,
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<string> {
    const { file, userId, userName, title, description, category, tags, visibility } = videoData

    // Crear referencia única para el archivo
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const videoRef = ref(storage, `videos/${userId}/${fileName}`)

    // Configurar upload
    const uploadTask = uploadBytesResumable(videoRef, file)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          const state = snapshot.state as 'running' | 'paused'

          if (onProgress) {
            onProgress({
              progress,
              state,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
            })
          }
        },
        error => {
          reject(error)
        },
        async () => {
          try {
            // Obtener URL de descarga
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

            // Crear registro en Firestore
            const videoDoc = await addDoc(collection(db, 'videos'), {
              title,
              description: description || '',
              uploaderId: userId,
              uploaderName: userName,
              videoURLs: {
                original: downloadURL,
              },
              thumbnailURL: '',
              category: category || 'Otros',
              tags: tags || [],
              language: 'es',
              visibility: visibility || 'public',
              status: 'published',
              duration: 0,
              viewCount: 0,
              likeCount: 0,
              dislikeCount: 0,
              commentCount: 0,
              uploadDate: serverTimestamp(),
              publishedAt: serverTimestamp(),
            })

            resolve(videoDoc.id)
          } catch (firestoreError) {
            // Si falla crear el documento, eliminar el archivo subido
            try {
              await deleteObject(videoRef)
            } catch {
              // File cleanup failed, but we'll still reject with the original error
            }

            reject(firestoreError)
          }
        }
      )
    })
  }

  async generateThumbnail(videoFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        video.currentTime = 1 // Capturar thumbnail en el segundo 1
      }

      video.onseeked = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const thumbnailDataURL = canvas.toDataURL('image/jpeg', 0.8)
          resolve(thumbnailDataURL)
        } else {
          reject(new Error('Could not get canvas context'))
        }
      }

      video.onerror = () => {
        reject(new Error('Error loading video for thumbnail generation'))
      }

      video.src = URL.createObjectURL(videoFile)
    })
  }

  async uploadThumbnail(
    thumbnailDataURL: string,
    userId: string,
    videoId: string
  ): Promise<string> {
    // Convertir data URL a blob
    const response = await fetch(thumbnailDataURL)
    const blob = await response.blob()

    // Crear referencia para el thumbnail
    const thumbnailRef = ref(storage, `thumbnails/${userId}/${videoId}.jpg`)

    // Subir thumbnail
    const uploadTask = uploadBytesResumable(thumbnailRef, blob)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        error => {
          reject(error)
        },
        async () => {
          try {
            const thumbnailURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(thumbnailURL)
          } catch (_error) {
            reject(_error)
          }
        }
      )
    })
  }

  async validateVideoFile(file: File): Promise<{ isValid: boolean; error?: string }> {
    const maxSize = 500 * 1024 * 1024 // 500MB
    const maxDuration = 20 * 60 // 20 minutes in seconds
    const allowedTypes = [
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/mkv',
      'video/webm',
      'video/x-msvideo',
      'video/quicktime',
      'video/mp4v-es',
      'video/h264',
      'video/h265',
      'video/hevc',
    ]

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Formato de archivo no soportado. Use MP4, MOV, AVI, MKV, WebM o HEVC.',
      }
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo es demasiado grande. Máximo 500MB.',
      }
    }

    // Check video duration
    try {
      const duration = await this.getVideoDuration(file)
      if (duration > maxDuration) {
        return {
          isValid: false,
          error: 'El video es demasiado largo. Máximo 20 minutos.',
        }
      }
    } catch {
      return {
        isValid: false,
        error: 'No se pudo verificar la duración del video.',
      }
    }

    return { isValid: true }
  }

  private getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src)
        reject(new Error('Error loading video metadata'))
      }

      video.src = window.URL.createObjectURL(file)
    })
  }
}

// Re-export the correct type
export type { FirestoreVideo as Video } from '../types/entities/video'
