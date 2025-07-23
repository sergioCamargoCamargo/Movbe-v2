import {
  EnhancedUserService,
  VideoService,
  CategoryService,
  VideoInteractionService,
} from '@/lib/services'
import { AuthService } from '@/lib/services/AuthService'
import { SubscriptionService } from '@/lib/services/SubscriptionService'
import { UserService } from '@/lib/services/UserService'

import { serviceContainer } from './ServiceContainer'

// Service keys - centralized service identifiers
export const SERVICE_KEYS = {
  // Legacy services (keep for compatibility during transition)
  USER_SERVICE: 'UserService',
  AUTH_SERVICE: 'AuthService',
  SUBSCRIPTION_SERVICE: 'SubscriptionService',

  // Modern services
  ENHANCED_USER_SERVICE: 'EnhancedUserService',
  VIDEO_SERVICE: 'VideoService',
  CATEGORY_SERVICE: 'CategoryService',
  VIDEO_INTERACTION_SERVICE: 'VideoInteractionService',
} as const

// Register all services
export function registerServices(): void {
  // Legacy services (for components not yet migrated)
  serviceContainer.registerSingleton(SERVICE_KEYS.AUTH_SERVICE, AuthService)
  serviceContainer.registerSingleton(SERVICE_KEYS.USER_SERVICE, UserService)
  serviceContainer.registerSingleton(SERVICE_KEYS.SUBSCRIPTION_SERVICE, SubscriptionService)

  // Modern services
  serviceContainer.registerSingleton(SERVICE_KEYS.ENHANCED_USER_SERVICE, EnhancedUserService)
  serviceContainer.registerSingleton(SERVICE_KEYS.VIDEO_SERVICE, VideoService)
  serviceContainer.registerSingleton(SERVICE_KEYS.CATEGORY_SERVICE, CategoryService)
  serviceContainer.registerSingleton(
    SERVICE_KEYS.VIDEO_INTERACTION_SERVICE,
    VideoInteractionService
  )
}

// Helper functions to resolve services with type safety

// Legacy services
export function getUserService(): UserService {
  return serviceContainer.resolve<UserService>(SERVICE_KEYS.USER_SERVICE)
}

export function getAuthService(): AuthService {
  return serviceContainer.resolve<AuthService>(SERVICE_KEYS.AUTH_SERVICE)
}

export function getSubscriptionService(): SubscriptionService {
  return serviceContainer.resolve<SubscriptionService>(SERVICE_KEYS.SUBSCRIPTION_SERVICE)
}

// Modern services
export function getEnhancedUserService(): EnhancedUserService {
  return serviceContainer.resolve<EnhancedUserService>(SERVICE_KEYS.ENHANCED_USER_SERVICE)
}

export function getVideoService(): VideoService {
  return serviceContainer.resolve<VideoService>(SERVICE_KEYS.VIDEO_SERVICE)
}

export function getCategoryService(): CategoryService {
  return serviceContainer.resolve<CategoryService>(SERVICE_KEYS.CATEGORY_SERVICE)
}

export function getVideoInteractionService(): VideoInteractionService {
  return serviceContainer.resolve<VideoInteractionService>(SERVICE_KEYS.VIDEO_INTERACTION_SERVICE)
}

// Initialize services on app startup
registerServices()
