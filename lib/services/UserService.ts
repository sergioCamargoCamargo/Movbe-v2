import { IUserService } from '@/lib/interfaces/IUserService'
import { FirebaseRepository } from '@/lib/repositories/FirebaseRepository'
import { AuthService } from '@/lib/services/AuthService'
import { User, UserSettings } from '@/types'

export class UserService implements IUserService {
  private repository: FirebaseRepository<User>
  private settingsRepository: FirebaseRepository<UserSettings>
  private authService: AuthService

  constructor() {
    this.repository = new FirebaseRepository<User>('users')
    this.settingsRepository = new FirebaseRepository<UserSettings>('userSettings')
    this.authService = new AuthService()
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = await this.authService.getCurrentUser()
      if (!currentUser) return null

      // Try to find user in Firestore
      let user = await this.repository.findById(currentUser.uid)

      // If user doesn't exist in Firestore, create it
      if (!user) {
        const newUser: User = {
          id: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || '',
          avatar: currentUser.photoURL || undefined,
          type: 'normal',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Remove id from newUser when creating (Firestore will use the provided ID)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...userData } = newUser
        await this.repository.create(currentUser.uid, userData)
        user = newUser
      }

      return user
    } catch {
      // console.error('Error getting current user:', error)
      return null
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await this.repository.findById(id)
    } catch {
      // console.error('Error getting user by id:', error)
      return null
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const updatedData = {
        ...data,
        updatedAt: new Date(),
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

  async uploadAvatar(userId: string, _file: File): Promise<string> {
    try {
      // Implementar lógica de subida de archivo
      // Por ahora retornamos una URL placeholder
      const avatarUrl = `https://api.placeholder.com/avatar/${userId}`

      await this.updateUser(userId, { avatar: avatarUrl })

      return avatarUrl
    } catch (error) {
      // console.error('Error uploading avatar:', error)
      throw error
    }
  }
}
