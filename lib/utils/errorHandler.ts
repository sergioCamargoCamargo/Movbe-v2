import { ERROR_MESSAGES } from '@/lib/constants/errorMessages'

export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public code?: string

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    this.code = code

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, _field?: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.AUTH.UNAUTHORIZED) {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string = ERROR_MESSAGES.GENERAL.NETWORK_ERROR) {
    super(message, 503, 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    // Firebase Auth errors
    if (error.message.includes('auth/')) {
      const errorCode = error.message.split('auth/')[1]

      switch (errorCode) {
        case 'user-not-found':
          return new AuthenticationError(ERROR_MESSAGES.AUTH.USER_NOT_FOUND)
        case 'wrong-password':
          return new AuthenticationError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS)
        case 'email-already-in-use':
          return new ValidationError(ERROR_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS)
        case 'weak-password':
          return new ValidationError(ERROR_MESSAGES.AUTH.WEAK_PASSWORD)
        case 'network-request-failed':
          return new NetworkError(ERROR_MESSAGES.AUTH.NETWORK_ERROR)
        default:
          return new AuthenticationError(error.message)
      }
    }

    // Firebase Firestore errors
    if (error.message.includes('firestore/')) {
      return new AppError(ERROR_MESSAGES.GENERAL.SERVER_ERROR, 500, 'FIRESTORE_ERROR')
    }

    return new AppError(error.message, 500, 'UNKNOWN_ERROR')
  }

  return new AppError(ERROR_MESSAGES.GENERAL.SERVER_ERROR, 500, 'UNKNOWN_ERROR')
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return ERROR_MESSAGES.GENERAL.SERVER_ERROR
}
