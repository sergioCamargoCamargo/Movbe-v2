'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ValidationResult } from '@/lib/utils/validation'

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: ((value: unknown) => string | null)[]
}

export interface BaseFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  submitText?: string
  loading?: boolean
  initialValues?: Record<string, unknown>
  className?: string
}

export function BaseForm({
  fields,
  onSubmit,
  submitText = 'Enviar',
  loading = false,
  initialValues = {},
  className = ''
}: BaseFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): ValidationResult => {
    const newErrors: Record<string, string> = {}

    fields.forEach(field => {
      const value = formData[field.name]
      
      // Check required fields
      if (field.required && (value === undefined || value === null || value === '')) {
        newErrors[field.name] = 'Este campo es obligatorio'
        return
      }

      // Run custom validations
      if (field.validation && value) {
        for (const validationFn of field.validation) {
          const error = validationFn(value)
          if (error) {
            newErrors[field.name] = error
            break
          }
        }
      }
    })

    setErrors(newErrors)
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateForm()
    if (!validation.isValid) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch {
      // console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.name]
    const commonProps = {
      id: field.name,
      value: (formData[field.name] as string) || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleInputChange(field.name, e.target.value),
      className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        hasError ? 'border-red-500' : 'border-gray-300'
      }`,
      placeholder: field.placeholder,
      required: field.required,
      disabled: loading || isSubmitting
    }

    let input: React.ReactNode

    switch (field.type) {
      case 'textarea':
        input = <textarea {...commonProps} rows={4} />
        break
      case 'select':
        input = (
          <select {...commonProps}>
            <option value=''>Selecciona una opción</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
        break
      default:
        input = <input {...commonProps} type={field.type} />
    }

    return (
      <div key={field.name} className='mb-4'>
        <label htmlFor={field.name} className='block text-sm font-medium text-gray-700 mb-1'>
          {field.label}
          {field.required && <span className='text-red-500 ml-1'>*</span>}
        </label>
        {input}
        {hasError && (
          <p className='text-red-500 text-sm mt-1'>{errors[field.name]}</p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {fields.map(renderField)}
      
      <div className='flex justify-end'>
        <Button
          type='submit'
          disabled={loading || isSubmitting}
          className='px-6 py-2'
        >
          {isSubmitting ? 'Enviando...' : submitText}
        </Button>
      </div>
    </form>
  )
}