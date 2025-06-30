export interface User {
  id: string
  email: string
  displayName: string
  avatar?: string
  type: UserType
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: string
  ageVerified: boolean
  dateOfBirth: string | null
  createdAt: string
  lastLoginAt: string
  subscriberCount: number
  videoCount: number
  totalViews: number
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
