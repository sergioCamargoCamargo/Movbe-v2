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
  } catch (error) {
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
  } catch (error) {
    throw error
  }
}

export const updateUserProfile = async (uid, updates) => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, updates)
    return true
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    throw error
  }
}

export const getPublicVideos = async (_limit = 20) => {
  try {
    console.log('🔄 Iniciando consulta a Firestore...')
    const videosRef = collection(db, 'videos')
    console.log('📁 Referencia de colección creada')
    
    // DEBUG: Primero probemos sin filtros para ver si hay datos
    console.log('🧪 DEBUGGING: Consultando TODOS los documentos sin filtros...')
    const allDocsSnapshot = await getDocs(videosRef)
    console.log('🔍 TOTAL documentos en colección videos:', allDocsSnapshot.size)
    
    if (allDocsSnapshot.size === 0) {
      console.log('❌ No hay documentos en la colección "videos"')
      return []
    }
    
    // Mostrar todos los documentos para debug
    const allVideos = []
    allDocsSnapshot.forEach(doc => {
      const videoData = { id: doc.id, ...doc.data() }
      console.log('📄 Documento encontrado:', {
        id: doc.id,
        title: videoData.title || 'Sin título',
        status: videoData.status,
        visibility: videoData.visibility,
        uploadDate: videoData.uploadDate
      })
      allVideos.push(videoData)
    })
    
    // Filtrar en el cliente
    const publicPublishedVideos = allVideos.filter(video => 
      video.visibility === 'public' && video.status === 'published'
    )
    
    console.log('✅ Videos filtrados (public + published):', publicPublishedVideos.length)
    console.log('📋 Videos válidos:', publicPublishedVideos.map(v => v.title || 'Sin título'))
    
    // Ordenar por fecha de subida (más recientes primero)
    publicPublishedVideos.sort((a, b) => {
      if (!a.uploadDate || !b.uploadDate) return 0
      return b.uploadDate.seconds - a.uploadDate.seconds
    })
    
    return publicPublishedVideos.slice(0, _limit)
    
  } catch (error) {
    console.error('❌ Error en getPublicVideos:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    throw error
  }
}

export const getVideoById = async videoId => {
  try {
    console.log('🔄 Buscando video por ID:', videoId)
    const videoRef = doc(db, 'videos', videoId)
    console.log('📁 Referencia de documento creada')
    
    const videoSnap = await getDoc(videoRef)
    console.log('📊 Documento obtenido, existe:', videoSnap.exists())

    if (videoSnap.exists()) {
      const videoData = { id: videoSnap.id, ...videoSnap.data() }
      console.log('✅ Video encontrado:', videoData.title || 'Sin título')
      return videoData
    }
    console.log('❌ Video no encontrado con ID:', videoId)
    return null
  } catch (error) {
    console.error('❌ Error en getVideoById:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    throw error
  }
}

// ========== SUSCRIPCIONES ==========

export const subscribeToChannel = async (subscriberId, channelId) => {
  try {
    console.log('📝 Suscribiendo usuario', subscriberId, 'al canal', channelId)
    
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
    
    console.log('✅ Suscripción creada exitosamente')
    return true
  } catch (error) {
    console.error('❌ Error al suscribirse:', error)
    throw error
  }
}

export const unsubscribeFromChannel = async (subscriberId, channelId) => {
  try {
    console.log('📝 Cancelando suscripción de usuario', subscriberId, 'al canal', channelId)
    
    // Decrementar contador de suscriptores del canal
    const channelRef = doc(db, 'users', channelId)
    await updateDoc(channelRef, {
      subscriberCount: increment(-1)
    })
    
    // Eliminar documento de suscripción
    const subscriptionRef = doc(db, 'subscriptions', `${subscriberId}_${channelId}`)
    await updateDoc(subscriptionRef, { status: 'unsubscribed' })
    
    console.log('✅ Suscripción cancelada exitosamente')
    return true
  } catch (error) {
    console.error('❌ Error al cancelar suscripción:', error)
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
  } catch (error) {
    console.error('❌ Error al verificar suscripción:', error)
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
  } catch (error) {
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
  } catch (error) {
    throw error
  }
}
