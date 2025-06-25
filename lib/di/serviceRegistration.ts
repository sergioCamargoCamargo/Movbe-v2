import { AuthService } from '@/lib/services/AuthService'
import { UserService } from '@/lib/services/UserService'

import { serviceContainer } from './ServiceContainer'

// Service keys - centralized service identifiers
export const SERVICE_KEYS = {
  USER_SERVICE: 'UserService',
  AUTH_SERVICE: 'AuthService',
  VIDEO_SERVICE: 'VideoService',
  ANALYTICS_SERVICE: 'AnalyticsService',
  NOTIFICATION_SERVICE: 'NotificationService',
} as const

// Register all services
export function registerServices(): void {
  // Register singleton services
  serviceContainer.registerSingleton(SERVICE_KEYS.AUTH_SERVICE, AuthService)
  serviceContainer.registerSingleton(SERVICE_KEYS.USER_SERVICE, UserService)

  // Add other services when implemented
  // serviceContainer.registerSingleton(SERVICE_KEYS.VIDEO_SERVICE, VideoService)
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

// Initialize services on app startup
registerServices()
