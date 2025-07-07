import { UserProfile, UserSettings } from '@/types'

export interface IUserService {
  getCurrentUser(): Promise<UserProfile | null>
  getUserById(id: string): Promise<UserProfile | null>
  updateUser(id: string, data: Partial<UserProfile>): Promise<UserProfile>
  deleteUser(id: string): Promise<boolean>
  getUserSettings(userId: string): Promise<UserSettings | null>
  updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>
  uploadAvatar(userId: string, file: File): Promise<string>
}
