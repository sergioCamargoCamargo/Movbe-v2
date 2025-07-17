import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth'

import { auth } from '@/lib/firebase'

export class AuthService {
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error) {
      // console.error('Error signing in:', error)
      throw error
    }
  }

  async signUp(email: string, password: string): Promise<FirebaseUser> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error) {
      // console.error('Error signing up:', error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      // console.error('Error signing out:', error)
      throw error
    }
  }

  async getCurrentUser(): Promise<FirebaseUser | null> {
    return new Promise(resolve => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe()
        resolve(user)
      })
    })
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('No authenticated user')
      }

      // Re-authenticate user with current password
      await signInWithEmailAndPassword(auth, user.email!, currentPassword)

      // Update password
      await updatePassword(user, newPassword)

      return true
    } catch {
      // console.error('Error changing password:', error)
      return false
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw error
    }
  }
}
