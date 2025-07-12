/**
 * Tipos base del sistema
 * Contiene interfaces y tipos fundamentales utilizados en toda la aplicación
 */

// Tipos básicos del sistema
export type UserRole = "generador" | "supervisor" | "transportista" | "gestor_externo" | "administrador"

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface User extends BaseEntity {
  name: string
  email: string
  role: UserRole
  department: string
  avatar?: string
  isActive: boolean
}

// Tipos de respuesta de API
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  status: number
  message: string
  details?: any
}

// Tipos de formularios
export interface FormField<T = any> {
  value: T
  error?: string
  touched?: boolean
}

export interface FormState<T> {
  fields: Record<keyof T, FormField>
  isValid: boolean
  isSubmitting: boolean
}

// Tipos de permisos
export interface Permission {
  resource: string
  actions: string[]
}

export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
}
