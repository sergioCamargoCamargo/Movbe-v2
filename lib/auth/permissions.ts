import { UserType } from '@/lib/types/entities/user'

export const ROLES = {
  NORMAL: 'normal',
  CREATOR: 'creator',
  BUSINESS: 'business',
  ADMIN: 'admin',
} as const

export const PERMISSIONS = {
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_USERS: 'manage_users',
  MODERATE_CONTENT: 'moderate_content',
  MANAGE_PLATFORM: 'manage_platform',
} as const

export const rolePermissions: Record<UserType, string[]> = {
  normal: [],
  creator: [PERMISSIONS.VIEW_ANALYTICS],
  business: [PERMISSIONS.VIEW_ANALYTICS],
  admin: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.MANAGE_PLATFORM,
  ],
}

export function hasPermission(userRole: string, permission: string): boolean {
  const permissions = rolePermissions[userRole as UserType] || []
  return permissions.includes(permission)
}

export function canViewAnalytics(userRole: string): boolean {
  return hasPermission(userRole, PERMISSIONS.VIEW_ANALYTICS)
}
