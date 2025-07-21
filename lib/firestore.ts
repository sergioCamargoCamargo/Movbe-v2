// Legacy compatibility file - redirects to new services
export * from './services/VideoService'
export * from './services/CategoryService'
export * from './services/VideoInteractionService'
export { EnhancedUserService as UserService } from './services/EnhancedUserService'

// Re-export types for backward compatibility
export type { VideoRating, Comment } from './types'
export type { Category } from './types/entities/category'
export type { FirestoreVideo as Video } from './types/entities/video'

// Legacy functions that still need to be implemented
export async function getVideoComments(_videoId: string) {
  // TODO: Implement with new service architecture
  return []
}

export async function addCommentToFirestore(_comment: unknown) {
  // TODO: Implement with new service architecture
  return 'temp-id'
}

export async function checkUserVideoLike(_videoId: string, _userId: string) {
  // TODO: Implement with new service architecture
  return null
}

export async function toggleVideoLikeInDB(_videoId: string, _userId: string, _isLike: boolean) {
  // TODO: Implement with new service architecture
}

export function createVideo(_data?: unknown) {
  // TODO: Implement with new service architecture
  return { id: 'temp-id' }
}
