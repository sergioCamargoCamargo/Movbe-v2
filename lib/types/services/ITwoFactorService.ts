import { User, MultiFactorError, PhoneMultiFactorInfo } from 'firebase/auth'

export interface TwoFactorSetupResult {
  success: boolean
  verificationId?: string
  error?: string
}

export interface TwoFactorVerificationResult {
  success: boolean
  error?: string
}

export interface ITwoFactorService {
  is2FAEnabled(user: User): Promise<boolean>
  getEnrolledFactors(user: User): Promise<PhoneMultiFactorInfo[]>
  startEnrollment(
    user: User,
    phoneNumber: string,
    recaptchaContainerId: string
  ): Promise<TwoFactorSetupResult>
  completeEnrollment(
    user: User,
    verificationId: string,
    verificationCode: string,
    displayName?: string
  ): Promise<TwoFactorVerificationResult>
  unenroll(user: User, factorUid: string): Promise<TwoFactorVerificationResult>
  verify2FA(
    multiFactorError: MultiFactorError,
    verificationId: string,
    verificationCode: string,
    selectedFactorIndex?: number
  ): Promise<TwoFactorVerificationResult>
  send2FACode(
    multiFactorError: MultiFactorError,
    recaptchaContainerId: string,
    selectedFactorIndex?: number
  ): Promise<TwoFactorSetupResult>
  cleanup(): void
}
