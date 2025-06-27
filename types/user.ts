export interface User {
  id: string
  email: string
  displayName: string
  avatar?: string
  type: UserType
  createdAt: Date
  updatedAt: Date
}

export type UserType = 'normal' | 'creator' | 'business' | 'admin'

export interface UserSettings {
  userId: string
  notifications: NotificationSettings
  privacy: PrivacySettings
  display: DisplaySettings
  security: SecuritySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  newVideos: boolean
  comments: boolean
  likes: boolean
  followers: boolean
  marketing: boolean
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private'
  showEmail: boolean
  showActivity: boolean
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  autoplay: boolean
  quality: 'auto' | '480p' | '720p' | '1080p'
}

export interface SecuritySettings {
  twoFactor: boolean
}
