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
  private static errorMessages: Record<string, string> = {
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'El email ya está en uso',
    'auth/weak-password': 'La contraseña es muy débil',
    'auth/invalid-email': 'Email inválido',
    'auth/user-disabled': 'Usuario deshabilitado',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión',
    'auth/popup-closed-by-user': 'Ventana cerrada por el usuario',
    'auth/cancelled-popup-request': 'Solicitud cancelada',

    'firestore/permission-denied': 'Permisos insuficientes',
    'firestore/not-found': 'Documento no encontrado',
    'firestore/already-exists': 'El documento ya existe',
    'firestore/resource-exhausted': 'Límite de operaciones excedido',
    'firestore/failed-precondition': 'Error en la condición previa',
    'firestore/aborted': 'Operación cancelada',
    'firestore/out-of-range': 'Valor fuera de rango',
    'firestore/unimplemented': 'Operación no implementada',
    'firestore/internal': 'Error interno del servidor',
    'firestore/unavailable': 'Servicio no disponible',
    'firestore/data-loss': 'Pérdida de datos',
    'firestore/unauthenticated': 'Usuario no autenticado',
    'firestore/invalid-argument': 'Argumento inválido',
    'firestore/deadline-exceeded': 'Tiempo de espera agotado',
    'firestore/cancelled': 'Operación cancelada',

    'storage/object-not-found': 'Archivo no encontrado',
    'storage/bucket-not-found': 'Bucket no encontrado',
    'storage/project-not-found': 'Proyecto no encontrado',
    'storage/quota-exceeded': 'Cuota de almacenamiento excedida',
    'storage/unauthenticated': 'Usuario no autenticado',
    'storage/unauthorized': 'Sin permisos para esta operación',
    'storage/retry-limit-exceeded': 'Límite de reintentos excedido',
    'storage/invalid-checksum': 'Checksum inválido',
    'storage/canceled': 'Operación cancelada',
    'storage/invalid-event-name': 'Nombre de evento inválido',
    'storage/invalid-url': 'URL inválida',
    'storage/invalid-argument': 'Argumento inválido',
    'storage/no-default-bucket': 'No hay bucket por defecto',
    'storage/cannot-slice-blob': 'Error al procesar archivo',
    'storage/server-file-wrong-size': 'Tamaño de archivo incorrecto',

    EMAIL_EXISTS: 'Este correo electrónico ya está registrado',
    WEAK_PASSWORD: 'La contraseña debe tener al menos 6 caracteres',
    INVALID_EMAIL: 'El correo electrónico no es válido',
    USER_NOT_FOUND: 'No existe una cuenta con este correo electrónico',
    WRONG_PASSWORD: 'La contraseña es incorrecta',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'Demasiados intentos fallidos. Intenta más tarde',

    'network-error': 'Error de conexión a internet',
    timeout: 'Tiempo de espera agotado',
    unknown: 'Error desconocido',
  }

  public static handle(error: unknown): ServiceError {
    // Handle Firebase error structure: {error: {code: 400, message: "EMAIL_EXISTS",...}}
    if (error && typeof error === 'object' && 'error' in error) {
      const errorObj = error as { error: { message?: string } }
      if (errorObj.error?.message) {
        const message = this.errorMessages[errorObj.error.message] || errorObj.error.message
        return { code: errorObj.error.message, message }
      }
    }

    if (error instanceof FirebaseError) {
      const message = this.errorMessages[error.code] || error.message
      return { code: error.code, message, originalError: error }
    }

    if (error instanceof Error) {
      return { code: 'unknown', message: error.message, originalError: error }
    }

    return { code: 'unknown', message: 'Error desconocido' }
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
