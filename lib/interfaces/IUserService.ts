import { User, UserSettings } from '@/types'

export interface IUserService {
  getCurrentUser(): Promise<User | null>
  getUserById(id: string): Promise<User | null>
  updateUser(id: string, data: Partial<User>): Promise<User>
  deleteUser(id: string): Promise<boolean>
  getUserSettings(userId: string): Promise<UserSettings | null>
  updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>
  uploadAvatar(userId: string, file: File): Promise<string>
}