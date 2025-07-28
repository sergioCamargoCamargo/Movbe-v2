import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  User,
  PhoneMultiFactorInfo,
  MultiFactorError,
  getMultiFactorResolver,
} from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import {
  ITwoFactorService,
  TwoFactorSetupResult,
  TwoFactorVerificationResult,
} from '@/lib/types/services/ITwoFactorService'

export class TwoFactorService implements ITwoFactorService {
  private recaptchaVerifier: RecaptchaVerifier | null = null

  /**
   * Initialize reCAPTCHA verifier for phone verification
   */
  private initializeRecaptcha(containerId: string): RecaptchaVerifier {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear()
    }

    // Firebase automatically handles reCAPTCHA configuration when Multi-Factor Authentication is enabled in Firebase Console

    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow phone authentication
      },
      'expired-callback': () => {
        // reCAPTCHA expired, user needs to re-verify
        // console.warn('reCAPTCHA expired')
      },
    })

    return this.recaptchaVerifier
  }

  /**
   * Check if user has 2FA enabled
   */
  async is2FAEnabled(user: User): Promise<boolean> {
    try {
      const multiFactorUser = multiFactor(user)
      return multiFactorUser.enrolledFactors.length > 0
    } catch {
      // console.error('Error checking 2FA status:', error)
      return false
    }
  }

  /**
   * Get enrolled factors for a user
   */
  async getEnrolledFactors(user: User): Promise<PhoneMultiFactorInfo[]> {
    try {
      const multiFactorUser = multiFactor(user)
      return multiFactorUser.enrolledFactors.filter(
        factor => factor.factorId === PhoneAuthProvider.PHONE_SIGN_IN_METHOD
      ) as PhoneMultiFactorInfo[]
    } catch {
      // console.error('Error getting enrolled factors:', error)
      return []
    }
  }

  /**
   * Start 2FA enrollment process
   */
  async startEnrollment(
    user: User,
    phoneNumber: string,
    recaptchaContainerId: string
  ): Promise<TwoFactorSetupResult> {
    try {
      const multiFactorUser = multiFactor(user)
      const session = await multiFactorUser.getSession()

      // Initialize reCAPTCHA
      const recaptchaVerifier = this.initializeRecaptcha(recaptchaContainerId)

      // Create phone auth provider
      const phoneInfoOptions = {
        phoneNumber,
        session,
      }

      // Send verification code using PhoneAuthProvider
      const phoneAuthProvider = new PhoneAuthProvider(auth)
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifier
      )

      return {
        success: true,
        verificationId,
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        // console.error('Error starting 2FA enrollment:', error)
      }
      return {
        success: false,
        error: this.getErrorMessage(error as { code?: string; message?: string }),
      }
    }
  }

  /**
   * Complete 2FA enrollment with verification code
   */
  async completeEnrollment(
    user: User,
    verificationId: string,
    verificationCode: string,
    displayName?: string
  ): Promise<TwoFactorVerificationResult> {
    try {
      const multiFactorUser = multiFactor(user)

      // Create phone credential
      const phoneCredential = PhoneAuthProvider.credential(verificationId, verificationCode)

      // Create multi-factor assertion
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneCredential)

      // Complete enrollment
      await multiFactorUser.enroll(multiFactorAssertion, displayName || 'Phone Number')

      return { success: true }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        // console.error('Error completing 2FA enrollment:', error)
      }
      return {
        success: false,
        error: this.getErrorMessage(error as { code?: string; message?: string }),
      }
    }
  }

  /**
   * Unenroll from 2FA
   */
  async unenroll(user: User, factorUid: string): Promise<TwoFactorVerificationResult> {
    try {
      const multiFactorUser = multiFactor(user)
      const enrolledFactors = multiFactorUser.enrolledFactors

      const factorToUnenroll = enrolledFactors.find(factor => factor.uid === factorUid)
      if (!factorToUnenroll) {
        return {
          success: false,
          error: 'Factor not found',
        }
      }

      await multiFactorUser.unenroll(factorToUnenroll)
      return { success: true }
    } catch (error: unknown) {
      // console.error('Error unenrolling from 2FA:', error)
      return {
        success: false,
        error: this.getErrorMessage(error as { code?: string; message?: string }),
      }
    }
  }

  /**
   * Handle 2FA verification during sign-in
   */
  async verify2FA(
    multiFactorError: MultiFactorError,
    verificationId: string,
    verificationCode: string,
    _selectedFactorIndex: number = 0
  ): Promise<TwoFactorVerificationResult> {
    try {
      const resolver = getMultiFactorResolver(auth, multiFactorError)

      // Create phone credential
      const phoneCredential = PhoneAuthProvider.credential(verificationId, verificationCode)

      // Create multi-factor assertion
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneCredential)

      // Complete sign-in with 2FA
      await resolver.resolveSignIn(multiFactorAssertion)

      return { success: true }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        // console.error('Error verifying 2FA:', error)
      }
      return {
        success: false,
        error: this.getErrorMessage(error as { code?: string; message?: string }),
      }
    }
  }

  /**
   * Send 2FA verification code during sign-in
   */
  async send2FACode(
    multiFactorError: MultiFactorError,
    recaptchaContainerId: string,
    _selectedFactorIndex: number = 0
  ): Promise<TwoFactorSetupResult> {
    try {
      const resolver = getMultiFactorResolver(auth, multiFactorError)
      const selectedHint = resolver.hints[_selectedFactorIndex] as PhoneMultiFactorInfo

      // Initialize reCAPTCHA
      const recaptchaVerifier = this.initializeRecaptcha(recaptchaContainerId)

      // Send verification code
      const phoneAuthProvider = new PhoneAuthProvider(auth)
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        {
          multiFactorHint: selectedHint,
          session: resolver.session,
        },
        recaptchaVerifier
      )

      return {
        success: true,
        verificationId,
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        // console.error('Error sending 2FA code:', error)
      }
      return {
        success: false,
        error: this.getErrorMessage(error as { code?: string; message?: string }),
      }
    }
  }

  /**
   * Clean up reCAPTCHA verifier
   */
  cleanup(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear()
      this.recaptchaVerifier = null
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: { code?: string; message?: string }): string {
    switch (error.code) {
      case 'auth/invalid-verification-code':
        return 'Código de verificación inválido'
      case 'auth/code-expired':
        return 'El código de verificación ha expirado'
      case 'auth/missing-verification-code':
        return 'Ingresa el código de verificación'
      case 'auth/invalid-phone-number':
        return 'Número de teléfono inválido'
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde'
      case 'auth/maximum-second-factor-count-exceeded':
        return 'Máximo número de factores alcanzado'
      case 'auth/second-factor-already-in-use':
        return 'Este número ya está registrado'
      default:
        return error.message || 'Error desconocido'
    }
  }
}

// Export singleton instance
export const twoFactorService = new TwoFactorService()
