/**
 * Utilidades de validación
 */

import { VALIDATION_PATTERNS, ERROR_MESSAGES } from '../constants'

export interface ValidationResult {
  isValid: boolean
  message?: string
}

// Validaciones básicas
export const validateRequired = (value: any): ValidationResult => {
  const isValid = value !== null && value !== undefined && value !== ''
  return {
    isValid,
    message: isValid ? undefined : ERROR_MESSAGES.REQUIRED_FIELD,
  }
}

export const validateEmail = (email: string): ValidationResult => {
  const isValid = VALIDATION_PATTERNS.EMAIL.test(email)
  return {
    isValid,
    message: isValid ? undefined : ERROR_MESSAGES.INVALID_EMAIL,
  }
}

export const validatePhone = (phone: string): ValidationResult => {
  const isValid = VALIDATION_PATTERNS.PHONE.test(phone)
  return {
    isValid,
    message: isValid ? undefined : ERROR_MESSAGES.INVALID_PHONE,
  }
}

export const validateMinLength = (value: string, minLength: number): ValidationResult => {
  const isValid = value.length >= minLength
  return {
    isValid,
    message: isValid ? undefined : ERROR_MESSAGES.MIN_LENGTH(minLength),
  }
}

export const validateMaxLength = (value: string, maxLength: number): ValidationResult => {
  const isValid = value.length <= maxLength
  return {
    isValid,
    message: isValid ? undefined : ERROR_MESSAGES.MAX_LENGTH(maxLength),
  }
}

export const validateDate = (date: string): ValidationResult => {
  const dateObj = new Date(date)
  const isValid = !isNaN(dateObj.getTime())
  return {
    isValid,
    message: isValid ? undefined : ERROR_MESSAGES.INVALID_DATE,
  }
}

export const validateFutureDate = (date: string): ValidationResult => {
  const dateObj = new Date(date)
  const now = new Date()
  const isValid = dateObj <= now
  return {
    isValid,
    message: isValid ? undefined : ERROR_MESSAGES.FUTURE_DATE_NOT_ALLOWED,
  }
}

export const validateCertificateNumber = (number: string): ValidationResult => {
  const isValid = VALIDATION_PATTERNS.CERTIFICATE_NUMBER.test(number)
  return {
    isValid,
    message: isValid ? undefined : 'Formato de certificado inválido',
  }
}

// Validación de rangos numéricos
export const validateNumberRange = (
  value: number,
  min?: number,
  max?: number
): ValidationResult => {
  if (min !== undefined && value < min) {
    return {
      isValid: false,
      message: `El valor debe ser mayor o igual a ${min}`,
    }
  }
  
  if (max !== undefined && value > max) {
    return {
      isValid: false,
      message: `El valor debe ser menor o igual a ${max}`,
    }
  }
  
  return { isValid: true }
}

// Validador compuesto
export const validateField = (
  value: any,
  rules: Array<(value: any) => ValidationResult>
): ValidationResult => {
  for (const rule of rules) {
    const result = rule(value)
    if (!result.isValid) {
      return result
    }
  }
  return { isValid: true }
}

// Validación de archivos
export const validateFile = (
  file: File,
  maxSize?: number,
  allowedTypes?: string[]
): ValidationResult => {
  if (maxSize && file.size > maxSize) {
    return {
      isValid: false,
      message: `El archivo debe ser menor a ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
    }
  }
  
  if (allowedTypes) {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        message: `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`,
      }
    }
  }
  
  return { isValid: true }
}
