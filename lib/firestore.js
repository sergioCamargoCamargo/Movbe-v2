import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  increment,
} from 'firebase/firestore'

import app from './firebase'

const db = getFirestore(app)

// ========== COLECCIÓN USERS ==========

export const createOrUpdateUser = async user => {
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
      return userSnap.data()
    } else {
      // Usuario nuevo, crear documento completo
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        role: 'normal',
        ageVerified: false,
        dateOfBirth: null,
        createdAt: now,
        lastLoginAt: now,
        // Estadísticas
        subscriberCount: 0,
        videoCount: 0,
        totalViews: 0,
      }

      await setDoc(userRef, userData)
      return userData
    }
  } catch {
    throw error
  }
}

export const getUserById = async uid => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return userSnap.data()
    }
    return null
  } catch {
    throw error
  }
}

export const updateUserProfile = async (uid, updates) => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, updates)
    return true
  } catch {
    throw error
  }
}

// ========== COLECCIÓN VIDEOS ==========

export const createVideo = async videoData => {
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

    return { id: docRef.id, ...video }
  } catch {
    throw error
  }
}

export const getVideosByUser = async (uploaderId, _limit = 20) => {
  try {
    const videosRef = collection(db, 'videos')
    const q = query(videosRef, where('uploaderId', '==', uploaderId), orderBy('uploadDate', 'desc'))

    const querySnapshot = await getDocs(q)
    const videos = []

    querySnapshot.forEach(doc => {
      videos.push({ id: doc.id, ...doc.data() })
    })

    return videos
  } catch {
    throw error
  }
}

export const getPublicVideos = async (_limit = 20) => {
  try {
    const videosRef = collection(db, 'videos')
    
    // DEBUG: Primero probemos sin filtros para ver si hay datos
    const allDocsSnapshot = await getDocs(videosRef)
    
    if (allDocsSnapshot.size === 0) {
      return []
    }
    
    // Mostrar todos los documentos para debug
    const allVideos = []
    allDocsSnapshot.forEach(doc => {
      const videoData = { id: doc.id, ...doc.data() }
      allVideos.push(videoData)
    })
    
    // Filtrar en el cliente
    const publicPublishedVideos = allVideos.filter(video => 
      video.visibility === 'public' && video.status === 'published'
    )
    
    
    // Ordenar por fecha de subida (más recientes primero)
    publicPublishedVideos.sort((a, b) => {
      if (!a.uploadDate || !b.uploadDate) return 0
      return b.uploadDate.seconds - a.uploadDate.seconds
    })
    
    return publicPublishedVideos.slice(0, _limit)
    
  } catch {
    throw error
  }
}

export const getVideoById = async videoId => {
  try {
    const videoRef = doc(db, 'videos', videoId)
    
    const videoSnap = await getDoc(videoRef)

    if (videoSnap.exists()) {
      const videoData = { id: videoSnap.id, ...videoSnap.data() }
      return videoData
    }
    return null
  } catch {
    throw error
  }
}

export const updateVideo = async (videoId, updates) => {
  try {
    const videoRef = doc(db, 'videos', videoId)

    // Si se está publicando el video, actualizar publishedAt
    if (updates.status === 'published' && !updates.publishedAt) {
      updates.publishedAt = serverTimestamp()
    }

    await updateDoc(videoRef, updates)
    return true
  } catch {
    throw error
  }
}

export const incrementVideoViews = async (videoId, uploaderId) => {
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
  } catch {
    throw error
  }
}

export const toggleVideoLike = async (videoId, userId, isLike = true) => {
  try {
    const videoRef = doc(db, 'videos', videoId)

    if (isLike) {
      await updateDoc(videoRef, {
        likeCount: increment(1),
      })
    } else {
      await updateDoc(videoRef, {
        dislikeCount: increment(1),
      })
    }

    return true
  } catch {
    throw error
  }
}

// ========== SUSCRIPCIONES ==========

export const subscribeToChannel = async (subscriberId, channelId) => {
  try {
    
    // Incrementar contador de suscriptores del canal
    const channelRef = doc(db, 'users', channelId)
    await updateDoc(channelRef, {
      subscriberCount: increment(1)
    })
    
    // Crear documento de suscripción
    const subscriptionRef = doc(db, 'subscriptions', `${subscriberId}_${channelId}`)
    await setDoc(subscriptionRef, {
      subscriberId,
      channelId,
      subscribedAt: serverTimestamp()
    })
    
    return true
  } catch {
    throw error
  }
}

export const unsubscribeFromChannel = async (subscriberId, channelId) => {
  try {
    
    // Decrementar contador de suscriptores del canal
    const channelRef = doc(db, 'users', channelId)
    await updateDoc(channelRef, {
      subscriberCount: increment(-1)
    })
    
    // Eliminar documento de suscripción
    const subscriptionRef = doc(db, 'subscriptions', `${subscriberId}_${channelId}`)
    await updateDoc(subscriptionRef, { status: 'unsubscribed' })
    
    return true
  } catch {
    throw error
  }
}

export const checkSubscription = async (subscriberId, channelId) => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', `${subscriberId}_${channelId}`)
    const subscriptionSnap = await getDoc(subscriptionRef)
    
    if (subscriptionSnap.exists()) {
      const data = subscriptionSnap.data()
      return data.status !== 'unsubscribed'
    }
    return false
  } catch {
    return false
  }
}

// ========== UTILIDADES ==========

export const deleteVideo = async (videoId, uploaderId) => {
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
  } catch {
    throw error
  }
}

export const searchVideos = async (searchTerm, limit = 20) => {
  try {
    const videosRef = collection(db, 'videos')
    const q = query(
      videosRef,
      where('visibility', '==', 'public'),
      where('status', '==', 'published'),
      orderBy('uploadDate', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const videos = []

    querySnapshot.forEach(doc => {
      const data = doc.data()
      // Búsqueda simple en título y descripción
      if (
        data.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        videos.push({ id: doc.id, ...data })
      }
    })

    return videos.slice(0, limit)
  } catch {
    throw error
  }
}
