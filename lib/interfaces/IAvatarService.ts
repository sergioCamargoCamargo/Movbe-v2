export interface AvatarUploadResult {
  photoURL: string
  success: boolean
  message?: string
}

import { Dispatch } from '@reduxjs/toolkit'

export interface IAvatarService {
  uploadAvatar(userId: string, file: File, dispatch?: Dispatch): Promise<AvatarUploadResult>
  deleteAvatar(userId: string, dispatch?: Dispatch): Promise<void>
  getAvatarUrl(userId: string): Promise<string | null>
}
