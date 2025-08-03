import { User, MultiFactorError } from 'firebase/auth'

export interface TwoFactorSetupProps {
  user: User
  onComplete?: () => void
}

export interface TwoFactorVerificationProps {
  error: MultiFactorError
  onSuccess: () => void
  onCancel: () => void
}

export type SetupStep = 'check' | 'password' | 'phone' | 'verify' | 'complete'
