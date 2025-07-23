import { FirebaseError } from 'firebase/app'

export interface ServiceError {
  code: string
  message: string
  originalError?: Error
}

export class FirebaseServiceError extends Error implements ServiceError {
  public code: string
  public originalError?: Error

  constructor(code: string, message: string, originalError?: Error) {
    super(message)
    this.name = 'FirebaseServiceError'
    this.code = code
    this.originalError = originalError
  }
}

export class FirebaseErrorHandler {
  private static getErrorMessage(code: string): string {
    // On server side, just return the code directly
    // i18n will be handled on the client side
    return code
  }

  public static handle(error: unknown): ServiceError {
    // Handle Firebase error structure: {error: {code: 400, message: "EMAIL_EXISTS",...}}
    if (error && typeof error === 'object' && 'error' in error) {
      const errorObj = error as { error: { message?: string } }
      if (errorObj.error?.message) {
        const message = this.getErrorMessage(errorObj.error.message)
        return { code: errorObj.error.message, message }
      }
    }

    if (error instanceof FirebaseError) {
      const message = this.getErrorMessage(error.code)
      return { code: error.code, message, originalError: error }
    }

    if (error instanceof Error) {
      return { code: 'unknown', message: error.message, originalError: error }
    }

    return { code: 'unknown', message: this.getErrorMessage('unknown') }
  }
}

export type FirebaseServiceResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: ServiceError
    }
