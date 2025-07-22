import { clsx, type ClassValue } from 'clsx'
import { DocumentData } from 'firebase/firestore'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function serializeTimestamps(data: DocumentData): DocumentData {
  const serialized = { ...data }

  Object.keys(data).forEach(key => {
    const value = data[key]
    if (value && typeof value === 'object' && 'seconds' in value) {
      serialized[key] = {
        seconds: value.seconds,
        nanoseconds: value.nanoseconds,
      }
    }
  })

  return serialized
}
