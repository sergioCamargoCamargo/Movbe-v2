import { Dispatch } from '@reduxjs/toolkit'
import { updateProfile, getAuth } from 'firebase/auth'
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

import app from '@/lib/firebase'
import { FirebaseRepository } from '@/lib/repositories/FirebaseRepository'
import { setUserProfile } from '@/lib/store/slices/authSlice'
import { IAvatarService, AvatarUploadResult } from '@/lib/types'
import { UserProfile } from '@/lib/types/entities/user'

export class AvatarService implements IAvatarService {
  private storage
  private userRepository: FirebaseRepository<UserProfile>

  constructor() {
    this.storage = getStorage(app)
    this.userRepository = new FirebaseRepository<UserProfile>('users')
  }

  async uploadAvatar(userId: string, file: File, dispatch?: Dispatch): Promise<AvatarUploadResult> {
    try {
      // Validar el archivo
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          photoURL: '',
          message: 'El archivo debe ser una imagen',
        }
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          photoURL: '',
          message: 'El archivo no puede ser mayor a 5MB',
        }
      }

      // Crear referencia única para el archivo
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const avatarRef = ref(this.storage, `avatars/${userId}/${fileName}`)

      // Subir archivo
      await uploadBytes(avatarRef, file)

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(avatarRef)

      // Actualizar perfil en Firestore usando el repositorio
      await this.userRepository.update(userId, { photoURL: downloadURL })

      // Actualizar perfil en Firebase Auth
      const auth = getAuth()
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: downloadURL })
      }

      // Actualizar estado de Redux si se proporciona dispatch
      if (dispatch) {
        const updatedUser = await this.userRepository.findById(userId)
        if (updatedUser) {
          dispatch(setUserProfile(updatedUser))
        }
      }

      return {
        success: true,
        photoURL: downloadURL,
        message: 'Avatar actualizado correctamente',
      }
    } catch (error) {
      return {
        success: false,
        photoURL: '',
        message: `Error al subir avatar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      }
    }
  }

  async deleteAvatar(userId: string, dispatch?: Dispatch): Promise<void> {
    try {
      // Obtener usuario actual para obtener la URL del avatar
      const user = await this.userRepository.findById(userId)
      if (!user?.photoURL) {
        throw new Error('No hay avatar para eliminar')
      }

      // Extraer el path del storage desde la URL
      const url = new URL(user.photoURL)
      const pathMatch = url.pathname.match(/\/o\/(.+)\?/)

      if (!pathMatch) {
        throw new Error('URL de avatar inválida')
      }

      const storagePath = decodeURIComponent(pathMatch[1])
      const avatarRef = ref(this.storage, storagePath)

      // Eliminar archivo del storage
      await deleteObject(avatarRef)

      // Actualizar perfil en Firestore usando el repositorio
      await this.userRepository.update(userId, { photoURL: null })

      // Actualizar perfil en Firebase Auth
      const auth = getAuth()
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: null })
      }

      // Actualizar estado de Redux si se proporciona dispatch
      if (dispatch) {
        const updatedUser = await this.userRepository.findById(userId)
        if (updatedUser) {
          dispatch(setUserProfile(updatedUser))
        }
      }
    } catch (error) {
      throw new Error(
        `Error al eliminar avatar: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  async getAvatarUrl(userId: string): Promise<string | null> {
    try {
      const user = await this.userRepository.findById(userId)
      return user?.photoURL || null
    } catch (error) {
      throw new Error(
        `Error al obtener URL del avatar: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }
}

export const avatarService = new AvatarService()
