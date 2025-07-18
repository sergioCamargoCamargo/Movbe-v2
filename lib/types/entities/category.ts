export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  displayName?: string
}

export interface FirestoreCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
  order: number
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export interface FirestoreTimestamp {
  seconds: number
  nanoseconds: number
}
