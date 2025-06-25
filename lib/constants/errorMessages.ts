export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    USER_NOT_FOUND: 'Usuario no encontrado',
    EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
    WEAK_PASSWORD: 'La contraseña es muy débil',
    NETWORK_ERROR: 'Error de conexión. Intenta nuevamente',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  },

  USER: {
    NOT_FOUND: 'Usuario no encontrado',
    UPDATE_FAILED: 'Error al actualizar el usuario',
    DELETE_FAILED: 'Error al eliminar el usuario',
    AVATAR_UPLOAD_FAILED: 'Error al subir el avatar',
  },

  VIDEO: {
    NOT_FOUND: 'Video no encontrado',
    UPLOAD_FAILED: 'Error al subir el video',
    INVALID_FORMAT: 'Formato de video no válido',
    FILE_TOO_LARGE: 'El archivo es muy grande',
    PROCESSING_ERROR: 'Error al procesar el video',
  },

  COMMENTS: {
    EMPTY_CONTENT: 'El comentario no puede estar vacío',
    CREATE_FAILED: 'Error al crear el comentario',
    UPDATE_FAILED: 'Error al actualizar el comentario',
    DELETE_FAILED: 'Error al eliminar el comentario',
  },

  GENERAL: {
    NETWORK_ERROR: 'Error de conexión',
    SERVER_ERROR: 'Error del servidor',
    VALIDATION_ERROR: 'Error de validación',
    PERMISSION_DENIED: 'Permisos insuficientes',
    RATE_LIMIT_EXCEEDED: 'Demasiadas solicitudes. Intenta más tarde',
  },

  FORMS: {
    REQUIRED_FIELD: 'Este campo es obligatorio',
    INVALID_EMAIL: 'Email inválido',
    PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres',
    PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
  },
} as const

export type ErrorMessage = typeof ERROR_MESSAGES
