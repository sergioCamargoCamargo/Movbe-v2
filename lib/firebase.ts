import { app } from './firebase/config'
import { FirebaseErrorHandler } from './firebase/errors'
export * from './firebase/config'
export * from './firebase/errors'

export default app

export function getFirebaseErrorMessage(error: unknown): string {
  return FirebaseErrorHandler.handle(error).message
}
