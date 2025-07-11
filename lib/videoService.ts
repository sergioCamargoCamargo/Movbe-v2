import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

import app from './firebase'
import { createVideo } from './firestore'

const storage = getStorage(app)

export interface VideoUploadData {
  title: string
  description?: string
  file: File
  userId: string
  userName: string
  category?: string
  tags?: string[]
  visibility?: 'public' | 'private'
}

export interface UploadProgress {
  progress: number
  state: 'running' | 'paused' | 'success' | 'error'
  bytesTransferred: number
  totalBytes: number
}

export const uploadVideo = async (
  videoData: VideoUploadData,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
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
        // Error will be propagated to caller
        reject(error)
      },
      async () => {
        try {
          // Obtener URL de descarga
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          // Crear registro en Firestore
          const videoDoc = await createVideo({
            title,
            description: description || '',
            uploaderId: userId,
            uploaderName: userName,
            videoURLs: {
              original: downloadURL,
            },
            thumbnailURL: '',
            category: category || 'general',
            tags: tags || [],
            language: 'es',
            visibility: visibility || 'public',
            status: 'published',
            duration: 0, // Se puede calcular después si es necesario
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

export const generateThumbnail = async (videoFile: File): Promise<string> => {
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

export const uploadThumbnail = async (
  thumbnailDataURL: string,
  userId: string,
  videoId: string
): Promise<string> => {
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
        // Error will be propagated to caller
        reject(error)
      },
      async () => {
        try {
          const thumbnailURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(thumbnailURL)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

export const deleteVideoFile = async (videoId: string, userId: string): Promise<boolean> => {
  try {
    // Eliminar archivo de video
    const videoRef = ref(storage, `videos/${userId}/${videoId}`)
    await deleteObject(videoRef)

    // Eliminar thumbnail si existe
    try {
      const thumbnailRef = ref(storage, `thumbnails/${userId}/${videoId}.jpg`)
      await deleteObject(thumbnailRef)
    } catch {
      // Thumbnail deletion failed, but continue
    }

    return true
  } catch (error) {
    // Error will be propagated to caller
    throw error
  }
}

export const getVideoMetadata = (
  file: File
): Promise<{ duration: number; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      })
    }

    video.onerror = () => {
      reject(new Error('Error loading video metadata'))
    }

    video.src = URL.createObjectURL(file)
  })
}

export const validateVideoFile = async (
  file: File
): Promise<{ isValid: boolean; error?: string }> => {
  const maxSize = 500 * 1024 * 1024 // 500MB
  const maxDuration = 20 * 60 // 20 minutes in seconds
  const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm']

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Formato de archivo no soportado. Use MP4, MOV, AVI, MKV o WebM.',
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
    const duration = await getVideoDuration(file)
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

const getVideoDuration = (file: File): Promise<number> => {
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
