/**
 * Tipos comunes para Firebase
 */

export interface FirestoreTimestamp {
  seconds: number
  nanoseconds: number
}

export type FirebaseTimestamp = FirestoreTimestamp | Date

/**
 * Utility function to create a fallback timestamp
 */
export const getFallbackTimestamp = (): FirestoreTimestamp => ({
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: 0,
})

/**
 * Type guard to check if a value is a FirestoreTimestamp
 */
export const isFirestoreTimestamp = (value: unknown): value is FirestoreTimestamp => {
  return (
    value !== null &&
    typeof value === 'object' &&
    'seconds' in value &&
    'nanoseconds' in value &&
    typeof (value as { seconds: unknown }).seconds === 'number' &&
    typeof (value as { nanoseconds: unknown }).nanoseconds === 'number'
  )
}

/**
 * Type guard to check if a value has a toDate method (Firebase Timestamp)
 */
export const hasToDateMethod = (value: unknown): value is { toDate(): Date } => {
  return typeof value === 'object' && value !== null && 'toDate' in value
}

/**
 * Safe date conversion utility
 */
export const toSafeDate = (timestamp: FirebaseTimestamp): Date => {
  if (hasToDateMethod(timestamp)) {
    return timestamp.toDate()
  }
  if (isFirestoreTimestamp(timestamp)) {
    return new Date(timestamp.seconds * 1000)
  }
  return timestamp instanceof Date ? timestamp : new Date()
}
