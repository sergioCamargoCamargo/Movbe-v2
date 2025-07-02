import { AuthService } from '@/lib/services/AuthService'
import { UserService } from '@/lib/services/UserService'
import { VideoService } from '@/lib/services/VideoService'
import { CommentService } from '@/lib/services/CommentService'
import { SubscriptionService } from '@/lib/services/SubscriptionService'
import { VideoInteractionService } from '@/lib/services/VideoInteractionService'

import { serviceContainer } from './ServiceContainer'

// Service keys - centralized service identifiers
export const SERVICE_KEYS = {
  USER_SERVICE: 'UserService',
  AUTH_SERVICE: 'AuthService',
  VIDEO_SERVICE: 'VideoService',
  COMMENT_SERVICE: 'CommentService',
  SUBSCRIPTION_SERVICE: 'SubscriptionService',
  VIDEO_INTERACTION_SERVICE: 'VideoInteractionService',
  ANALYTICS_SERVICE: 'AnalyticsService',
  NOTIFICATION_SERVICE: 'NotificationService',
} as const

// Register all services
export function registerServices(): void {
  // Register singleton services
  serviceContainer.registerSingleton(SERVICE_KEYS.AUTH_SERVICE, AuthService)
  serviceContainer.registerSingleton(SERVICE_KEYS.USER_SERVICE, UserService)
  serviceContainer.registerSingleton(SERVICE_KEYS.VIDEO_SERVICE, VideoService)
  serviceContainer.registerSingleton(SERVICE_KEYS.COMMENT_SERVICE, CommentService)
  serviceContainer.registerSingleton(SERVICE_KEYS.SUBSCRIPTION_SERVICE, SubscriptionService)
  serviceContainer.registerSingleton(SERVICE_KEYS.VIDEO_INTERACTION_SERVICE, VideoInteractionService)

  // Add other services when implemented
  // serviceContainer.registerSingleton(SERVICE_KEYS.ANALYTICS_SERVICE, AnalyticsService)
  // serviceContainer.registerSingleton(SERVICE_KEYS.NOTIFICATION_SERVICE, NotificationService)
}

// Helper functions to resolve services with type safety
export function getUserService(): UserService {
  return serviceContainer.resolve<UserService>(SERVICE_KEYS.USER_SERVICE)
}

export function getAuthService(): AuthService {
  return serviceContainer.resolve<AuthService>(SERVICE_KEYS.AUTH_SERVICE)
}

export function getVideoService(): VideoService {
  return serviceContainer.resolve<VideoService>(SERVICE_KEYS.VIDEO_SERVICE)
}

export function getCommentService(): CommentService {
  return serviceContainer.resolve<CommentService>(SERVICE_KEYS.COMMENT_SERVICE)
}

export function getSubscriptionService(): SubscriptionService {
  return serviceContainer.resolve<SubscriptionService>(SERVICE_KEYS.SUBSCRIPTION_SERVICE)
}

export function getVideoInteractionService(): VideoInteractionService {
  return serviceContainer.resolve<VideoInteractionService>(SERVICE_KEYS.VIDEO_INTERACTION_SERVICE)
}

// Initialize services on app startup
registerServices()
