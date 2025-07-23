import { Dispatch } from '@reduxjs/toolkit'
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

import app from '@/lib/firebase'
import { FirebaseRepository } from '@/lib/repositories/FirebaseRepository'
import { setUserProfile } from '@/lib/store/slices/authSlice'
import { UserProfile } from '@/lib/types/entities/user'

export interface CoverImageUploadResult {
  success: boolean
  coverImageURL: string
  message: string
}

export interface ICoverImageService {
  uploadCoverImage(userId: string, file: File, dispatch?: Dispatch): Promise<CoverImageUploadResult>
  deleteCoverImage(userId: string, dispatch?: Dispatch): Promise<void>
  getCoverImageUrl(userId: string): Promise<string | null>
}

export class CoverImageService implements ICoverImageService {
  private storage
  private userRepository: FirebaseRepository<UserProfile>

  constructor() {
    this.storage = getStorage(app)
    this.userRepository = new FirebaseRepository<UserProfile>('users')
  }

  async uploadCoverImage(
    userId: string,
    file: File,
    dispatch?: Dispatch
  ): Promise<CoverImageUploadResult> {
    try {
      // Validar el archivo
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          coverImageURL: '',
          message: 'El archivo debe ser una imagen',
        }
      }

      // Validar tamaño (10MB máximo para cover images)
      if (file.size > 10 * 1024 * 1024) {
        return {
          success: false,
          coverImageURL: '',
          message: 'El archivo no puede ser mayor a 10MB',
        }
      }

      // Validar dimensiones recomendadas (opcional pero recomendado)
      const validationResult = await this.validateImageDimensions(file)
      if (!validationResult.valid && validationResult.warning) {
        // Continue with upload despite warning
      }

      // Crear referencia única para el archivo
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const coverRef = ref(this.storage, `covers/${userId}/${fileName}`)

      // Subir archivo
      await uploadBytes(coverRef, file)

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(coverRef)

      // Actualizar perfil en Firestore usando el repositorio
      await this.userRepository.update(userId, { coverImageURL: downloadURL })

      // Actualizar estado de Redux si se proporciona dispatch
      if (dispatch) {
        const updatedUser = await this.userRepository.findById(userId)
        if (updatedUser) {
          dispatch(setUserProfile(updatedUser))
        }
      }

      return {
        success: true,
        coverImageURL: downloadURL,
        message: 'Imagen de portada actualizada correctamente',
      }
    } catch (error) {
      return {
        success: false,
        coverImageURL: '',
        message: `Error al subir la imagen de portada: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      }
    }
  }

  async deleteCoverImage(userId: string, dispatch?: Dispatch): Promise<void> {
    try {
      // Obtener usuario actual para obtener la URL de la imagen de portada
      const user = await this.userRepository.findById(userId)
      if (!user?.coverImageURL) {
        throw new Error('No hay imagen de portada para eliminar')
      }

      // Extraer el path del storage desde la URL
      const url = new URL(user.coverImageURL)
      const pathMatch = url.pathname.match(/\/o\/(.+)\?/)

      if (!pathMatch) {
        throw new Error('URL de imagen de portada inválida')
      }

      const storagePath = decodeURIComponent(pathMatch[1])
      const coverRef = ref(this.storage, storagePath)

      // Eliminar archivo del storage
      await deleteObject(coverRef)

      // Actualizar perfil en Firestore usando el repositorio
      await this.userRepository.update(userId, { coverImageURL: null })

      // Actualizar estado de Redux si se proporciona dispatch
      if (dispatch) {
        const updatedUser = await this.userRepository.findById(userId)
        if (updatedUser) {
          dispatch(setUserProfile(updatedUser))
        }
      }
    } catch (error) {
      throw new Error(
        `Error al eliminar imagen de portada: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  async getCoverImageUrl(userId: string): Promise<string | null> {
    try {
      const user = await this.userRepository.findById(userId)
      return user?.coverImageURL || null
    } catch (error) {
      throw new Error(
        `Error al obtener URL de la imagen de portada: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  private async validateImageDimensions(file: File): Promise<{ valid: boolean; warning?: string }> {
    return new Promise(resolve => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        const aspectRatio = img.width / img.height
        const recommendedAspectRatio = 16 / 9 // Aspect ratio recomendado para cover images

        // Verificar si las dimensiones son muy pequeñas
        if (img.width < 1280 || img.height < 720) {
          resolve({
            valid: true,
            warning: 'Se recomienda usar imágenes de al menos 1280x720 píxeles para mejor calidad',
          })
          return
        }

        // Verificar aspect ratio
        if (Math.abs(aspectRatio - recommendedAspectRatio) > 0.1) {
          resolve({
            valid: true,
            warning: 'Se recomienda usar imágenes con proporción 16:9 para mejor visualización',
          })
          return
        }

        resolve({ valid: true })
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        resolve({ valid: false, warning: 'Error al validar las dimensiones de la imagen' })
      }

      img.src = objectUrl
    })
  }
}

export const coverImageService = new CoverImageService()
