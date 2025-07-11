import { User } from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  increment,
  DocumentData,
  QueryDocumentSnapshot,
  FieldValue,
} from 'firebase/firestore'

import { UserProfile } from '@/types/user'

import app from './firebase'
import { Comment, VideoLike, VideoRating } from './interfaces'

// Re-export interfaces for external use
export type { Comment, VideoLike, VideoRating } from './interfaces'

const db = getFirestore(app)

// ========== COLECCIÓN USERS ==========

export const createOrUpdateUser = async (user: User): Promise<UserProfile | null> => {
  if (!user?.uid) return null

  try {
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)

    const now = new Date()

    if (userSnap.exists()) {
      // Usuario existe, actualizar lastLoginAt
      await updateDoc(userRef, {
        lastLoginAt: now,
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
      })
      return userSnap.data() as UserProfile
    } else {
      // Usuario nuevo, crear documento completo
      const userData: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        role: 'normal',
        ageVerified: false,
        dateOfBirth: null,
        createdAt: now.toISOString(),
        lastLoginAt: now.toISOString(),
        // Estadísticas
        subscriberCount: 0,
        videoCount: 0,
        totalViews: 0,
      }

      await setDoc(userRef, userData)
      return userData
    }
  } catch (error) {
    throw error
  }
}

export const getUserById = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile
    }
    return null
  } catch (error) {
    throw error
  }
}

export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, updates)
    return true
  } catch (error) {
    throw error
  }
}

// ========== COLECCIÓN VIDEOS ==========

export interface VideoData {
  title: string
  description: string
  uploaderId: string
  uploaderName: string
  videoURLs: {
    original: string
  }
  thumbnailURL: string
  duration: number
  category: string
  tags: string[]
  language: string
  status: 'published' | 'processing' | 'draft'
  visibility: 'public' | 'private' | 'unlisted'
}

export interface Video extends VideoData {
  id: string
  viewCount: number
  likeCount: number
  dislikeCount: number
  commentCount: number
  uploadDate: Date | null
  publishedAt: Date | null
  rating?: number
  ratingCount?: number
}

export const createVideo = async (videoData: VideoData): Promise<Video> => {
  try {
    const videosRef = collection(db, 'videos')

    const video = {
      // Información básica
      title: videoData.title,
      description: videoData.description || '',
      uploaderId: videoData.uploaderId,
      uploaderName: videoData.uploaderName,

      // URLs de archivos
      videoURLs: videoData.videoURLs || {},
      thumbnailURL: videoData.thumbnailURL || null,

      // Estadísticas
      viewCount: 0,
      likeCount: 0,
      dislikeCount: 0,
      commentCount: 0,

      // Metadatos
      duration: videoData.duration || 0,
      category: videoData.category || 'general',
      tags: videoData.tags || [],
      language: videoData.language || 'es',

      // Estado
      status: videoData.status || 'processing',
      visibility: videoData.visibility || 'public',

      // Timestamps
      uploadDate: serverTimestamp(),
      publishedAt: videoData.status === 'published' ? serverTimestamp() : null,
    }

    const docRef = await addDoc(videosRef, video)

    // Actualizar contador de videos del usuario
    const userRef = doc(db, 'users', videoData.uploaderId)
    await updateDoc(userRef, {
      videoCount: increment(1),
    })

    return { id: docRef.id, ...video } as unknown as Video
  } catch (error) {
    throw error
  }
}

export const getVideosByUser = async (uploaderId: string, _limit = 20): Promise<Video[]> => {
  try {
    const videosRef = collection(db, 'videos')
    const q = query(videosRef, where('uploaderId', '==', uploaderId), orderBy('uploadDate', 'desc'))

    const querySnapshot = await getDocs(q)
    const videos: Video[] = []

    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data()
      // Convert Firebase Timestamps to Date for Redux serialization
      const video = {
        id: doc.id,
        ...data,
        uploadDate: data.uploadDate?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate() || new Date(),
      } as Video
      videos.push(video)
    })

    return videos
  } catch (error) {
    throw error
  }
}

export const getPublicVideos = async (_limit = 20): Promise<Video[]> => {
  try {
    const videosRef = collection(db, 'videos')
    const q = query(
      videosRef,
      where('visibility', '==', 'public'),
      where('status', '==', 'published'),
      orderBy('uploadDate', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const videos: Video[] = []

    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data()
      // Convert Firebase Timestamps to Date for Redux serialization
      const video = {
        id: doc.id,
        ...data,
        uploadDate: data.uploadDate?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate() || new Date(),
      } as Video
      videos.push(video)
    })

    return videos
  } catch (error) {
    throw error
  }
}

export const getVideoById = async (videoId: string): Promise<Video | null> => {
  try {
    const videoRef = doc(db, 'videos', videoId)
    const videoSnap = await getDoc(videoRef)

    if (videoSnap.exists()) {
      const data = videoSnap.data()
      // Convert Firebase Timestamps to Date for Redux serialization
      return {
        id: videoSnap.id,
        ...data,
        uploadDate: data.uploadDate?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate() || new Date(),
      } as Video
    }
    return null
  } catch (error) {
    throw error
  }
}

export const updateVideo = async (
  videoId: string,
  updates: Partial<VideoData> & { publishedAt?: FieldValue; thumbnailURL?: string }
): Promise<boolean> => {
  try {
    const videoRef = doc(db, 'videos', videoId)

    // Si se está publicando el video, actualizar publishedAt
    const updatesWithTimestamp = { ...updates }
    if (updates.status === 'published' && !updatesWithTimestamp.publishedAt) {
      updatesWithTimestamp.publishedAt = serverTimestamp()
    }

    await updateDoc(videoRef, updatesWithTimestamp)
    return true
  } catch (error) {
    throw error
  }
}

export const incrementVideoViews = async (
  videoId: string,
  uploaderId: string
): Promise<boolean> => {
  try {
    const videoRef = doc(db, 'videos', videoId)
    const userRef = doc(db, 'users', uploaderId)

    // Incrementar vistas del video y del usuario
    await Promise.all([
      updateDoc(videoRef, {
        viewCount: increment(1),
      }),
      updateDoc(userRef, {
        totalViews: increment(1),
      }),
    ])

    return true
  } catch (error) {
    throw error
  }
}

// ========== UTILIDADES ==========

export const deleteVideo = async (videoId: string, uploaderId: string): Promise<boolean> => {
  try {
    const videoRef = doc(db, 'videos', videoId)
    const userRef = doc(db, 'users', uploaderId)

    // Eliminar video y actualizar contador del usuario
    await Promise.all([
      updateDoc(videoRef, { status: 'deleted' }), // Soft delete
      updateDoc(userRef, {
        videoCount: increment(-1),
      }),
    ])

    return true
  } catch (error) {
    throw error
  }
}

export const searchVideos = async (searchTerm: string, limit = 20): Promise<Video[]> => {
  try {
    const videosRef = collection(db, 'videos')
    const q = query(
      videosRef,
      where('visibility', '==', 'public'),
      where('status', '==', 'published'),
      orderBy('uploadDate', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const videos: Video[] = []

    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data()
      // Búsqueda simple en título y descripción
      if (
        data.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        // Convert Firebase Timestamp to ISO string for Redux serialization
        const videoData = {
          id: doc.id,
          ...data,
          uploadDate: data.uploadDate?.toDate().toISOString() || new Date().toISOString(),
          publishedAt: data.publishedAt?.toDate().toISOString() || new Date().toISOString(),
        } as Video
        videos.push(videoData)
      }
    })

    return videos.slice(0, limit)
  } catch (error) {
    throw error
  }
}

// ========== COLECCIÓN COMMENTS ==========

export const getVideoComments = async (videoId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, 'comments')
    const q = query(commentsRef, where('videoId', '==', videoId))

    const querySnapshot = await getDocs(q)
    const comments: Comment[] = []

    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data()
      // Convert Firebase Timestamp to Date for Redux serialization
      const comment = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Comment
      comments.push(comment)
    })

    return comments
  } catch (error) {
    throw error
  }
}

export const addComment = async (
  comment: Omit<Comment, 'id' | 'createdAt' | 'likeCount' | 'replies'>
): Promise<string> => {
  try {
    const commentsRef = collection(db, 'comments')

    const newComment = {
      ...comment,
      createdAt: serverTimestamp(),
      likeCount: 0,
      replies: [],
    }

    const docRef = await addDoc(commentsRef, newComment)

    // Update comment count in video
    const videoRef = doc(db, 'videos', comment.videoId)
    await updateDoc(videoRef, {
      commentCount: increment(1),
    })

    return docRef.id
  } catch (error) {
    throw error
  }
}

// ========== COLECCIÓN VIDEOLIKES ==========

export const checkUserVideoLike = async (
  videoId: string,
  userId: string
): Promise<VideoLike | null> => {
  try {
    const likesRef = collection(db, 'videoLikes')
    const q = query(likesRef, where('videoId', '==', videoId), where('userId', '==', userId))

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      // Convert Firebase Timestamp to Date for Redux serialization
      return {
        id: doc.id,
        ...data,
        likedAt: data.likedAt?.toDate() || new Date(),
      } as VideoLike
    }

    return null
  } catch (error) {
    throw error
  }
}

export const toggleVideoLike = async (
  videoId: string,
  userId: string,
  isLike: boolean
): Promise<boolean> => {
  try {
    const existingLike = await checkUserVideoLike(videoId, userId)
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

// ========== COLECCIÓN VIDEOVIEWS ==========

export const recordVideoView = async (videoId: string, userId: string): Promise<boolean> => {
  try {
    // Check if user already viewed this video today
    const viewsRef = collection(db, 'videoViews')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const q = query(viewsRef, where('videoId', '==', videoId), where('userId', '==', userId))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      // First time viewing this video
      await addDoc(viewsRef, {
        videoId,
        userId,
        viewedAt: serverTimestamp(),
      })

      // Increment view count in video
      const videoRef = doc(db, 'videos', videoId)
      await updateDoc(videoRef, {
        viewCount: increment(1),
      })
    }
    // If user already viewed, don't increment again

    return true
  } catch (error) {
    throw error
  }
}

// ========== COLECCIÓN VIDEORATINGS ==========

export const getUserVideoRating = async (
  videoId: string,
  userId: string
): Promise<VideoRating | null> => {
  try {
    const ratingsRef = collection(db, 'videoRatings')
    const q = query(ratingsRef, where('videoId', '==', videoId), where('userId', '==', userId))

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        ratedAt: data.ratedAt?.toDate() || new Date(),
      } as VideoRating
    }

    return null
  } catch (error) {
    throw error
  }
}

export const rateVideo = async (
  videoId: string,
  userId: string,
  rating: number
): Promise<boolean> => {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }

    const existingRating = await getUserVideoRating(videoId, userId)
    const ratingsRef = collection(db, 'videoRatings')

    if (existingRating) {
      // Update existing rating
      const ratingRef = doc(db, 'videoRatings', existingRating.id)
      await updateDoc(ratingRef, {
        rating,
        ratedAt: serverTimestamp(),
      })
    } else {
      // Create new rating
      await addDoc(ratingsRef, {
        videoId,
        userId,
        rating,
        ratedAt: serverTimestamp(),
      })
    }

    // Recalculate video average rating
    await updateVideoAverageRating(videoId)

    return true
  } catch (error) {
    throw error
  }
}

export const updateVideoAverageRating = async (videoId: string): Promise<void> => {
  try {
    const ratingsRef = collection(db, 'videoRatings')
    const q = query(ratingsRef, where('videoId', '==', videoId))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      // No ratings, set to 0
      const videoRef = doc(db, 'videos', videoId)
      await updateDoc(videoRef, {
        rating: 0,
        ratingCount: 0,
      })
      return
    }

    let totalRating = 0
    let ratingCount = 0

    querySnapshot.forEach(doc => {
      const data = doc.data()
      totalRating += data.rating
      ratingCount++
    })

    const averageRating = totalRating / ratingCount

    // Update video with new average rating
    const videoRef = doc(db, 'videos', videoId)
    await updateDoc(videoRef, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      ratingCount,
    })
  } catch (error) {
    throw error
  }
}

export const getVideoRatings = async (videoId: string): Promise<VideoRating[]> => {
  try {
    const ratingsRef = collection(db, 'videoRatings')
    const q = query(ratingsRef, where('videoId', '==', videoId), orderBy('ratedAt', 'desc'))

    const querySnapshot = await getDocs(q)
    const ratings: VideoRating[] = []

    querySnapshot.forEach(doc => {
      const data = doc.data()
      ratings.push({
        id: doc.id,
        ...data,
        ratedAt: data.ratedAt?.toDate() || new Date(),
      } as VideoRating)
    })

    return ratings
  } catch (error) {
    throw error
  }
}
