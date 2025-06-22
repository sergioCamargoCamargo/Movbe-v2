import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:demo-app-id',
}

// Check if we're in development mode with placeholder values
const isPlaceholderConfig =
  firebaseConfig.apiKey === 'placeholder' || firebaseConfig.apiKey === 'demo-api-key'

let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

export const auth = getAuth(app)

// Only connect to emulator in development with placeholder config
if (
  typeof window !== 'undefined' &&
  isPlaceholderConfig &&
  process.env.NODE_ENV === 'development'
) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099')
  } catch {
    // Emulator already connected or not available
  }
}

export default app
