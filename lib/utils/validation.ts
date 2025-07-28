import { ERROR_MESSAGES } from '@/lib/constants/errorMessages'

export interface ValidationRule<T> {
  field: keyof T
  rules: ((value: unknown) => string | null)[]
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export class Validator {
  static email(value: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return ERROR_MESSAGES.FORMS.INVALID_EMAIL
    }
    return null
  }

  static required(value: unknown): string | null {
    if (value === null || value === undefined || value === '') {
      return ERROR_MESSAGES.FORMS.REQUIRED_FIELD
    }
    return null
  }

  static minLength(length: number) {
    return (value: string): string | null => {
      if (value && value.length < length) {
        return `Debe tener al menos ${length} caracteres`
      }
      return null
    }
  }

  static maxLength(length: number) {
    return (value: string): string | null => {
      if (value && value.length > length) {
        return `Debe tener máximo ${length} caracteres`
      }
      return null
    }
  }

  static passwordStrength(value: string): string | null {
    if (value.length < 12) {
      return 'La contraseña debe tener al menos 12 caracteres'
    }

    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumbers = /\d/.test(value)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    const hasRepeatingChars = /(.)\1{2,}/.test(value)

    if (!hasUpperCase) {
      return 'La contraseña debe incluir al menos una mayúscula'
    }

    if (!hasLowerCase) {
      return 'La contraseña debe incluir al menos una minúscula'
    }

    if (!hasNumbers) {
      return 'La contraseña debe incluir al menos un número'
    }

    if (!hasSpecialChar) {
      return 'La contraseña debe incluir al menos un símbolo (!@#$%^&*(),.?":{}|<>)'
    }

    if (hasRepeatingChars) {
      return 'La contraseña no puede tener 3 o más caracteres consecutivos iguales'
    }

    // Check against common passwords
    const commonPasswords = [
      'password123',
      '123456789',
      'qwerty123',
      'admin123',
      'user1234',
      'password1',
      'letmein123',
      'welcome123',
      'master123',
      '123qweasd',
    ]

    if (commonPasswords.includes(value.toLowerCase())) {
      return 'Esta contraseña es muy común, por favor elige una diferente'
    }

    return null
  }

  static passwordMatch(confirmPassword: string) {
    return (password: string): string | null => {
      if (password !== confirmPassword) {
        return ERROR_MESSAGES.FORMS.PASSWORDS_DONT_MATCH
      }
      return null
    }
  }

  static url(value: string): string | null {
    try {
      new URL(value)
      return null
    } catch {
      return 'URL inválida'
    }
  }

  static validateObject<T>(obj: T, rules: ValidationRule<T>[]): ValidationResult {
    const errors: Record<string, string> = {}

    rules.forEach(rule => {
      const value = obj[rule.field]

      for (const validationFn of rule.rules) {
        const error = validationFn(value)
        if (error) {
          errors[rule.field as string] = error
          break // Stop at first error for this field
        }
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  static validateForm(
    formData: FormData,
    rules: Record<string, ((value: unknown) => string | null)[]>
  ): ValidationResult {
    const errors: Record<string, string> = {}

    Object.entries(rules).forEach(([field, validationRules]) => {
      const value = formData.get(field)

      for (const validationFn of validationRules) {
        const error = validationFn(value)
        if (error) {
          errors[field] = error
          break
        }
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }
}

// Common validation rule sets
export const commonValidations = {
  email: [Validator.required, Validator.email],
  password: [Validator.required, Validator.passwordStrength],
  name: [Validator.required, Validator.minLength(2), Validator.maxLength(50)],
  title: [Validator.required, Validator.minLength(3), Validator.maxLength(100)],
  description: [Validator.maxLength(500)],
  url: [Validator.url],
}
