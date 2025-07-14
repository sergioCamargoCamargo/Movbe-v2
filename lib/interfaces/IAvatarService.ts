export interface AvatarUploadData {
  file: File
  userId: string
}

export interface AvatarUploadResult {
  photoURL: string
  success: boolean
  message?: string
}

import { Dispatch } from '@reduxjs/toolkit'

export interface IAvatarService {
  uploadAvatar(userId: string, file: File, dispatch?: Dispatch): Promise<string>
  deleteAvatar(userId: string, dispatch?: Dispatch): Promise<void>
  getAvatarUrl(userId: string): Promise<string | null>
}
