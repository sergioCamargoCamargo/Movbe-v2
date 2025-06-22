import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app

export function getFirebaseErrorMessage(error: unknown): string {
  // Handle Firebase error structure: {error: {code: 400, message: "EMAIL_EXISTS",...}}
  if (error && typeof error === 'object' && 'error' in error) {
    const errorObj = error as { error: { message?: string } }
    if (errorObj.error?.message) {
      switch (errorObj.error.message) {
      case 'EMAIL_EXISTS':
        return 'Este correo electrónico ya está registrado'
      case 'WEAK_PASSWORD':
        return 'La contraseña debe tener al menos 6 caracteres'
      case 'INVALID_EMAIL':
        return 'El correo electrónico no es válido'
      case 'USER_NOT_FOUND':
        return 'No existe una cuenta con este correo electrónico'
      case 'WRONG_PASSWORD':
        return 'La contraseña es incorrecta'
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        return 'Demasiados intentos fallidos. Intenta más tarde'
      default:
        return errorObj.error.message
      }
    }
  }
  
  // Handle Firebase Auth error codes
  if (error && typeof error === 'object' && 'code' in error) {
    const errorObj = error as { code: string }
    switch (errorObj.code) {
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado'
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres'
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido'
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo electrónico'
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta'
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta más tarde'
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu internet'
      case 'auth/popup-closed-by-user':
        return 'Ventana cerrada por el usuario'
      case 'auth/cancelled-popup-request':
        return 'Solicitud cancelada'
      default:
        return 'Error de autenticación'
    }
  }
  
  return 'Error al procesar la solicitud'
}
