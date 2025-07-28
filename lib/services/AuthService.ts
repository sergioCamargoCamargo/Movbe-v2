import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  sendPasswordResetEmail,
  User as FirebaseUser,
  MultiFactorError,
} from 'firebase/auth'

import { auth } from '@/lib/firebase'
import { twoFactorService } from './TwoFactorService'

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

  // 2FA Methods
  async is2FAEnabled(user: FirebaseUser): Promise<boolean> {
    return await twoFactorService.is2FAEnabled(user)
  }

  async getEnrolledFactors(user: FirebaseUser) {
    return await twoFactorService.getEnrolledFactors(user)
  }

  async startTwoFactorEnrollment(
    user: FirebaseUser,
    phoneNumber: string,
    recaptchaContainerId: string
  ) {
    return await twoFactorService.startEnrollment(user, phoneNumber, recaptchaContainerId)
  }

  async completeTwoFactorEnrollment(
    user: FirebaseUser,
    verificationId: string,
    verificationCode: string,
    displayName?: string
  ) {
    return await twoFactorService.completeEnrollment(
      user,
      verificationId,
      verificationCode,
      displayName
    )
  }

  async unenrollTwoFactor(user: FirebaseUser, factorUid: string) {
    return await twoFactorService.unenroll(user, factorUid)
  }

  async verifyTwoFactor(
    error: MultiFactorError,
    verificationId: string,
    verificationCode: string,
    selectedFactorIndex?: number
  ) {
    return await twoFactorService.verify2FA(
      error,
      verificationId,
      verificationCode,
      selectedFactorIndex
    )
  }

  async sendTwoFactorCode(
    error: MultiFactorError,
    recaptchaContainerId: string,
    selectedFactorIndex?: number
  ) {
    return await twoFactorService.send2FACode(error, recaptchaContainerId, selectedFactorIndex)
  }

  cleanup2FA() {
    twoFactorService.cleanup()
  }
}
