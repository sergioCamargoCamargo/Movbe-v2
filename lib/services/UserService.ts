import { doc, setDoc } from 'firebase/firestore'

import app from '@/lib/firebase'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

import { db } from '@/lib/firebase'
import { IUserService } from '@/lib/interfaces/IUserService'
import { FirebaseRepository } from '@/lib/repositories/FirebaseRepository'
import { AuthService } from '@/lib/services/AuthService'
import { UserProfile, UserSettings } from '@/types'

export class UserService implements IUserService {
  private repository: FirebaseRepository<UserProfile>
  private settingsRepository: FirebaseRepository<UserSettings>
  private authService: AuthService

  constructor() {
    this.repository = new FirebaseRepository<UserProfile>('users')
    this.settingsRepository = new FirebaseRepository<UserSettings>('userSettings')
    this.authService = new AuthService()
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const currentUser = await this.authService.getCurrentUser()
      if (!currentUser) return null

      // Try to find user in Firestore
      let user = await this.repository.findById(currentUser.uid)

      // If user doesn't exist in Firestore, create it
      if (!user) {
        const now = new Date().toISOString()
        const newUser: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: 'normal',
          ageVerified: false,
          dateOfBirth: null,
          createdAt: now,
          lastLoginAt: now,
          subscriberCount: 0,
          videoCount: 0,
          totalViews: 0,
        }

        await setDoc(doc(db, 'users', currentUser.uid), newUser)
        user = newUser
      }

      return user
    } catch {
      // console.error('Error getting current user:', error)
      return null
    }
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    try {
      return await this.repository.findById(id)
    } catch {
      // console.error('Error getting user by id:', error)
      return null
    }
  }

  async updateUser(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const updatedData = {
        ...data,
        lastLoginAt: new Date().toISOString(),
      }

      await this.repository.update(id, updatedData)
      const updatedUser = await this.repository.findById(id)

      if (!updatedUser) {
        throw new Error('User not found after update')
      }

      return updatedUser
    } catch (error) {
      // console.error('Error updating user:', error)
      throw error
    }
  }

  // Alias for consistency with age verification component
  async updateUserProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return this.updateUser(id, data)
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await this.repository.delete(id)
      await this.settingsRepository.delete(id)
      return true
    } catch {
      // console.error('Error deleting user:', error)
      return false
    }
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      return await this.settingsRepository.findById(userId)
    } catch {
      // console.error('Error getting user settings:', error)
      return null
    }
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const existingSettings = await this.settingsRepository.findById(userId)

      const updatedSettings: UserSettings = {
        userId,
        notifications: {
          email: true,
          push: true,
          newVideos: true,
          comments: true,
          likes: true,
          followers: true,
          marketing: false,
          ...existingSettings?.notifications,
          ...settings.notifications,
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showActivity: true,
          ...existingSettings?.privacy,
          ...settings.privacy,
        },
        display: {
          theme: 'system',
          language: 'es',
          autoplay: true,
          quality: 'auto',
          ...existingSettings?.display,
          ...settings.display,
        },
        security: {
          twoFactor: false,
          ...existingSettings?.security,
          ...settings.security,
        },
      }

      if (existingSettings) {
        await this.settingsRepository.update(userId, updatedSettings)
      } else {
        // When creating, we include the userId field
        await this.settingsRepository.create(userId, updatedSettings)
      }

      return updatedSettings
    } catch (error) {
      // console.error('Error updating user settings:', error)
      throw error
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      return await this.authService.changePassword(currentPassword, newPassword)
    } catch {
      // console.error('Error changing password:', error)
      return false
    }
  }

  async createUserProfile(
    userId: string,
    userData: {
      email: string
      displayName: string
      firstName: string
      lastName: string
      termsAccepted: boolean
      photoURL?: string | null
      dateOfBirth?: string
      isAdult?: boolean
    }
  ): Promise<void> {
    try {
      // Verificar edad del lado del servidor
      if (userData.dateOfBirth) {
        const birthDate = new Date(userData.dateOfBirth)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }

        if (age < 18) {
          throw new Error('Debes ser mayor de 18 años para registrarte en esta plataforma')
        }
      }

      const now = new Date().toISOString()

      // Create user profile in the format that matches Firebase structure
      const userProfile = {
        uid: userId,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: 'normal',
        ageVerified: userData.isAdult || false,
        dateOfBirth: userData.dateOfBirth || null,
        createdAt: now,
        lastLoginAt: now,
        subscriberCount: 0,
        videoCount: 0,
        totalViews: 0,
        firstName: userData.firstName,
        lastName: userData.lastName,
        termsAccepted: userData.termsAccepted,
        termsAcceptedAt: userData.termsAccepted ? now : null,
        isAdult: userData.isAdult || false,
      }

      await setDoc(doc(db, 'users', userId), userProfile)
    } catch (error) {
      // console.error('Error creating user profile:', error)
      throw error
    }
  }


async uploadAvatar(userId: string, file: File): Promise<string> {
  try {
    const storage = getStorage(app) // Obtener instancia de storage
    const avatarRef = ref(storage, `avatars/${userId}/${file.name}`)

    await uploadBytes(avatarRef, file)
    const downloadURL = await getDownloadURL(avatarRef)

    // Actualizar el campo photoURL en el perfil del usuario
    await this.updateUser(userId, { photoURL: downloadURL })

    return downloadURL
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw error
  }
}


  // async uploadAvatar(userId: string, _file: File): Promise<string> {
  //   try {
  //     // Implementar lógica de subida de archivo
  //     // Por ahora retornamos una URL placeholder
  //     const avatarUrl = `https://api.placeholder.com/avatar/${userId}`

  //     await this.updateUser(userId, { photoURL: avatarUrl })

  //     return avatarUrl
  //   } catch (error) {
  //     // console.error('Error uploading avatar:', error)
  //     throw error
  //   }
  // }
}
