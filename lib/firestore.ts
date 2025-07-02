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
} from 'firebase/firestore'

import { UserProfile } from '@/types/user'

import app from './firebase'

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
        email: user.email || '',
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
    console.error('Error creating/updating user:', error)
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
    console.error('Error getting user:', error)
    throw error
  }
}

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, updates as any)
    return true
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// ========== COLECCIÓN VIDEOS ==========

interface VideoData {
  title: string
  description?: string
  uploaderId: string
  uploaderName: string
  videoURLs?: { original?: string }
  thumbnailURL?: string
  duration?: number
  category?: string
  tags?: string[]
  language?: string
  status?: string
  visibility?: string
}

interface Video {
  id: string
  title: string
  description: string
  uploaderId: string
  uploaderName: string
  videoURLs: { original: string }
  thumbnailURL: string | null
  viewCount: number
  likeCount: number
  dislikeCount: number
  commentCount: number
  duration: number
  category: string
  tags: string[]
  language: string
  status: string
  visibility: string
  uploadDate: any
  publishedAt: any
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

    return { id: docRef.id, ...video } as Video
  } catch (error) {
    console.error('Error creating video:', error)
    throw error
  }
}

export const updateVideo = async (videoId: string, updates: any): Promise<boolean> => {
  try {
    const videoRef = doc(db, 'videos', videoId)
    await updateDoc(videoRef, updates)
    return true
  } catch (error) {
    console.error('Error updating video:', error)
    throw error
  }
}

export const getPublicVideos = async (_limit = 20): Promise<Video[]> => {
  try {
    const videosRef = collection(db, 'videos')

    // Get all documents first
    const allDocsSnapshot = await getDocs(videosRef)

    if (allDocsSnapshot.size === 0) {
      return []
    }

    const allVideos: Video[] = []
    allDocsSnapshot.forEach(doc => {
      const videoData = { id: doc.id, ...doc.data() } as Video
      allVideos.push(videoData)
    })

    // Filter on client side
    const publicPublishedVideos = allVideos.filter(
      video => video.visibility === 'public' && video.status === 'published'
    )

    // Sort by upload date (most recent first)
    publicPublishedVideos.sort((a, b) => {
      if (!a.uploadDate || !b.uploadDate) return 0
      return b.uploadDate.seconds - a.uploadDate.seconds
    })

    return publicPublishedVideos.slice(0, _limit)
  } catch (error) {
    console.error('Error getting public videos:', error)
    return []
  }
}

export const getVideoById = async (videoId: string): Promise<Video | null> => {
  try {
    const videoRef = doc(db, 'videos', videoId)
    const videoSnap = await getDoc(videoRef)

    if (videoSnap.exists()) {
      return { id: videoSnap.id, ...videoSnap.data() } as Video
    }
    return null
  } catch (error) {
    console.error('Error getting video by ID:', error)
    return null
  }
}

export const incrementVideoViews = async (videoId: string, uploaderId: string): Promise<boolean> => {
  try {
    const videoRef = doc(db, 'videos', videoId)
    const userRef = doc(db, 'users', uploaderId)

    // Increment view count for video and total views for user
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
    console.error('Error incrementing video views:', error)
    return false
  }
}

// ========== LIKES/DISLIKES ==========

export const toggleVideoLike = async (videoId: string, userId: string, isLike: boolean): Promise<{ action: string; isLike: boolean }> => {
  try {
    const videoRef = doc(db, 'videos', videoId)
    const likesRef = collection(db, 'videoLikes')
    const likeQuery = query(
      likesRef,
      where('videoId', '==', videoId),
      where('userId', '==', userId)
    )

    const querySnapshot = await getDocs(likeQuery)

    if (!querySnapshot.empty) {
      // User already has a like/dislike
      const existingLike = querySnapshot.docs[0]
      const existingData = existingLike.data()

      if (existingData.isLike === isLike) {
        // User is removing their like/dislike
        await deleteDoc(existingLike.ref)

        if (isLike) {
          await updateDoc(videoRef, { likeCount: increment(-1) })
        } else {
          await updateDoc(videoRef, { dislikeCount: increment(-1) })
        }

        return { action: 'removed', isLike }
      } else {
        // User is changing from like to dislike or vice versa
        await updateDoc(existingLike.ref, {
          isLike,
          likedAt: serverTimestamp(),
        })

        if (isLike) {
          // Changing from dislike to like
          await updateDoc(videoRef, {
            likeCount: increment(1),
            dislikeCount: increment(-1),
          })
        } else {
          // Changing from like to dislike
          await updateDoc(videoRef, {
            likeCount: increment(-1),
            dislikeCount: increment(1),
          })
        }

        return { action: 'changed', isLike }
      }
    } else {
      // New like/dislike
      await addDoc(likesRef, {
        videoId,
        userId,
        isLike,
        likedAt: serverTimestamp(),
      })

      if (isLike) {
        await updateDoc(videoRef, { likeCount: increment(1) })
      } else {
        await updateDoc(videoRef, { dislikeCount: increment(1) })
      }

      return { action: 'added', isLike }
    }
  } catch (error) {
    console.error('Error toggling video like:', error)
    throw error
  }
}

export const getUserVideoLikeStatus = async (videoId: string, userId: string) => {
  try {
    if (!userId) return { liked: false, disliked: false }

    const likesRef = collection(db, 'videoLikes')
    const likeQuery = query(
      likesRef,
      where('videoId', '==', videoId),
      where('userId', '==', userId)
    )

    const querySnapshot = await getDocs(likeQuery)

    if (!querySnapshot.empty) {
      const likeData = querySnapshot.docs[0].data()
      return {
        liked: likeData.isLike === true,
        disliked: likeData.isLike === false,
      }
    }

    return { liked: false, disliked: false }
  } catch (error) {
    console.error('Error getting user video like status:', error)
    return { liked: false, disliked: false }
  }
}

// ========== COMENTARIOS ==========

export const addComment = async (videoId: string, userId: string, userName: string, text: string) => {
  try {
    const commentsRef = collection(db, 'comments')
    const videoRef = doc(db, 'videos', videoId)

    const commentData = {
      videoId,
      userId,
      userName,
      text,
      likeCount: 0,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(commentsRef, commentData)

    // Increment comment count in video
    await updateDoc(videoRef, {
      commentCount: increment(1),
    })

    return { id: docRef.id, ...commentData }
  } catch (error) {
    console.error('Error adding comment:', error)
    throw error
  }
}

export const getCommentsByVideoId = async (videoId: string) => {
  try {
    const commentsRef = collection(db, 'comments')
    const q = query(commentsRef, where('videoId', '==', videoId))

    const querySnapshot = await getDocs(q)
    const comments: any[] = []

    querySnapshot.forEach(doc => {
      const data = doc.data()
      comments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : new Date(),
      })
    })

    // Sort manually by creation date
    comments.sort((a, b) => {
      const timeA = a.createdAt ? a.createdAt.getTime() : 0
      const timeB = b.createdAt ? b.createdAt.getTime() : 0
      return timeB - timeA // Most recent first
    })

    return comments
  } catch (error) {
    console.error('Error getting comments:', error)
    return []
  }
}

export const toggleCommentLike = async (commentId: string, userId: string) => {
  try {
    const commentRef = doc(db, 'comments', commentId)
    const likesRef = collection(db, 'commentLikes')
    const likeId = `${commentId}_${userId}`
    const likeRef = doc(likesRef, likeId)

    const likeSnap = await getDoc(likeRef)

    if (likeSnap.exists()) {
      // User already liked, remove like
      await deleteDoc(likeRef)
      await updateDoc(commentRef, {
        likeCount: increment(-1),
      })
      return false // Like removed
    } else {
      // Add like
      await setDoc(likeRef, {
        commentId,
        userId,
        likedAt: serverTimestamp(),
      })
      await updateDoc(commentRef, {
        likeCount: increment(1),
      })
      return true // Like added
    }
  } catch (error) {
    console.error('Error toggling comment like:', error)
    throw error
  }
}

// ========== SUBSCRIPTIONS ==========

export const subscribeToChannel = async (subscriberId: string, channelId: string) => {
  try {
    // Increment subscriber count for channel
    const channelRef = doc(db, 'users', channelId)
    await updateDoc(channelRef, {
      subscriberCount: increment(1),
    })

    // Create subscription document
    const subscriptionRef = doc(db, 'subscriptions', `${subscriberId}_${channelId}`)
    await setDoc(subscriptionRef, {
      subscriberId,
      channelId,
      subscribedAt: serverTimestamp(),
      status: 'active',
    })

    return true
  } catch (error) {
    console.error('Error subscribing to channel:', error)
    throw error
  }
}

export const unsubscribeFromChannel = async (subscriberId: string, channelId: string) => {
  try {
    // Decrement subscriber count for channel
    const channelRef = doc(db, 'users', channelId)
    await updateDoc(channelRef, {
      subscriberCount: increment(-1),
    })

    // Update subscription document
    const subscriptionRef = doc(db, 'subscriptions', `${subscriberId}_${channelId}`)
    await updateDoc(subscriptionRef, { 
      status: 'unsubscribed',
      unsubscribedAt: serverTimestamp()
    })

    return true
  } catch (error) {
    console.error('Error unsubscribing from channel:', error)
    throw error
  }
}

export const checkSubscription = async (subscriberId: string, channelId: string) => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', `${subscriberId}_${channelId}`)
    const subscriptionSnap = await getDoc(subscriptionRef)

    if (subscriptionSnap.exists()) {
      const data = subscriptionSnap.data()
      return data.status === 'active'
    }
    return false
  } catch (error) {
    console.error('Error checking subscription:', error)
    return false
  }
}

// ========== UTILITIES ==========

export const deleteVideo = async (videoId: string, uploaderId: string) => {
  try {
    const videoRef = doc(db, 'videos', videoId)
    const userRef = doc(db, 'users', uploaderId)

    // Delete video and update user counter
    await Promise.all([
      updateDoc(videoRef, { status: 'deleted' }), // Soft delete
      updateDoc(userRef, {
        videoCount: increment(-1),
      }),
    ])

    return true
  } catch (error) {
    console.error('Error deleting video:', error)
    throw error
  }
}

export const searchVideos = async (searchTerm: string, limit = 20) => {
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

    querySnapshot.forEach(doc => {
      const data = doc.data() as Video
      // Simple search in title and description
      if (
        data.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        const { id: _, ...videoData } = data
        videos.push({ id: doc.id, ...videoData })
      }
    })

    return videos.slice(0, limit)
  } catch (error) {
    console.error('Error searching videos:', error)
    throw error
  }
}

export const getVideosByUser = async (userId: string, limit = 20): Promise<any[]> => {
  try {
    const videosQuery = query(
      collection(db, 'videos'),
      where('uploaderId', '==', userId),
      where('visibility', '==', 'public'),
      orderBy('uploadDate', 'desc')
    )

    const querySnapshot = await getDocs(videosQuery)
    const videos: any[] = []

    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data()
      if (data.status === 'published') {
        videos.push({ id: doc.id, ...data })
      }
    })

    return videos.slice(0, limit)
  } catch (error) {
    console.error('Error getting videos by user:', error)
    throw error
  }
}