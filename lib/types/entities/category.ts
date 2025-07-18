import { FirestoreTimestamp } from '../common/firebase'

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  isActive: boolean
  order: number
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
  // Computed fields for frontend
  displayName?: string
  count?: number
}

export interface FirestoreCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  isActive: boolean
  order: number
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}
