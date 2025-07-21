import {
  User,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

import { db } from '../firebase/config'
import { FirebaseErrorHandler } from '../firebase/errors'
import { UserProfile, UserSettings } from '../types/entities/user'

export class EnhancedUserService {
  async createOrUpdateUser(user: User): Promise<UserProfile | null> {
    try {
      if (!user?.uid) return null

      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      const now = new Date()

      if (userSnap.exists()) {
        const updateData = {
          lastLoginAt: now.toISOString(),
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
        }

        await updateDoc(userRef, updateData)
        return { ...userSnap.data(), ...updateData } as UserProfile
      } else {
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
          subscriberCount: 0,
          videoCount: 0,
          totalViews: 0,
        }

        await setDoc(userRef, userData)
        return userData
      }
    } catch (error) {
      console.error('Error in createOrUpdateUser:', error)
      return null
    }
  }

  async getUserById(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        return userSnap.data() as UserProfile
      }
      return null
    } catch (error) {
      console.error('Error in getUserById:', error)
      return null
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, updates)
      return true
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      return false
    }
  }

  async getUserSettings(uid: string): Promise<UserSettings | null> {
    try {
      const settingsRef = doc(db, 'userSettings', uid)
      const settingsSnap = await getDoc(settingsRef)

      if (settingsSnap.exists()) {
        return settingsSnap.data() as UserSettings
      }

      // Create default settings
      const defaultSettings: UserSettings = {
        userId: uid,
        notifications: {
          email: true,
          push: true,
          newVideos: true,
          comments: true,
          likes: true,
          followers: true,
          marketing: false,
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showActivity: true,
        },
        display: {
          theme: 'system',
          language: 'es',
          autoplay: true,
          quality: 'auto',
        },
        security: {
          twoFactor: false,
        },
      }

      await setDoc(settingsRef, defaultSettings)
      return defaultSettings
    } catch (error) {
      console.error('Error in getUserSettings:', error)
      return null
    }
  }

  async updateUserSettings(uid: string, settings: Partial<UserSettings>): Promise<boolean> {
    try {
      const settingsRef = doc(db, 'userSettings', uid)
      await updateDoc(settingsRef, settings)
      return true
    } catch (error) {
      console.error('Error in updateUserSettings:', error)
      return false
    }
  }

  // Get auth provider info for password change functionality
  async getAuthProviders(user: User): Promise<string[]> {
    try {
      return user.providerData.map(provider => provider.providerId)
    } catch (error) {
      console.error('Error getting auth providers:', error)
      return []
    }
  }

  canChangePassword(user: User): boolean {
    const providers = user.providerData.map(provider => provider.providerId)
    // Only allow password change for email/password authentication
    return providers.includes('password') && providers.length === 1
  }

  async updateUser(uid: string, updates: Partial<UserProfile>): Promise<boolean> {
    return this.updateUserProfile(uid, updates)
  }

  async changePassword(
    user: User,
    currentPassword: string,
    newPassword: string
  ): Promise<{
    success: boolean
    message: string
  }> {
    try {
      if (!user.email) {
        return {
          success: false,
          message: 'No se pudo obtener el email del usuario',
        }
      }

      if (!this.canChangePassword(user)) {
        return {
          success: false,
          message: 'No se puede cambiar la contraseña para este tipo de cuenta',
        }
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)

      return {
        success: true,
        message: 'Contraseña cambiada exitosamente',
      }
    } catch (error) {
      const firebaseError = FirebaseErrorHandler.handle(error)

      // Handle specific authentication errors
      if (
        firebaseError.code === 'auth/wrong-password' ||
        firebaseError.code === 'auth/invalid-credential'
      ) {
        return {
          success: false,
          message: 'La contraseña actual es incorrecta',
        }
      }

      if (firebaseError.code === 'auth/weak-password') {
        return {
          success: false,
          message: 'La nueva contraseña es demasiado débil',
        }
      }

      if (firebaseError.code === 'auth/requires-recent-login') {
        return {
          success: false,
          message:
            'Por seguridad, necesitas iniciar sesión nuevamente antes de cambiar tu contraseña',
        }
      }

      return {
        success: false,
        message: firebaseError.message || 'Error al cambiar la contraseña',
      }
    }
  }
}
