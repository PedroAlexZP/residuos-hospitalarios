/**
 * Tipos específicos del módulo de autenticación
 */

import { BaseEntity, UserRole } from '@/shared/types'

export interface AuthUser extends BaseEntity {
  name: string
  email: string
  role: UserRole
  department: string
  avatar?: string
  isActive: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  department: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
  expiresIn: number
}

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordReset {
  token: string
  password: string
  confirmPassword: string
}
