/**
 * Servicio de autenticación
 */

import { BaseApiClient } from '@/shared/services/base-api'
import { APP_CONFIG } from '@/shared/config/app'
import type { AuthUser, LoginCredentials, RegisterData, AuthResponse, PasswordResetRequest, PasswordReset } from '../types'

export class AuthService extends BaseApiClient {
  private static instance: AuthService

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.post<{ jwt: string; user: AuthUser }>('/auth/local', {
      identifier: credentials.email,
      password: credentials.password,
    })

    return {
      user: response.user,
      token: response.jwt,
      expiresIn: 86400, // 24 horas
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.post<{ jwt: string; user: AuthUser }>('/auth/local/register', {
      username: data.email,
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      department: data.department,
    })

    return {
      user: response.user,
      token: response.jwt,
      expiresIn: 86400,
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.post<{ jwt: string; user: AuthUser }>('/auth/refresh')
    
    return {
      user: response.user,
      token: response.jwt,
      expiresIn: 86400,
    }
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await this.post('/auth/forgot-password', {
      email: data.email,
    })
  }

  async resetPassword(data: PasswordReset): Promise<void> {
    await this.post('/auth/reset-password', {
      code: data.token,
      password: data.password,
      passwordConfirmation: data.confirmPassword,
    })
  }

  async getCurrentUser(): Promise<AuthUser> {
    return this.get<AuthUser>('/users/me')
  }

  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    return this.put<AuthUser>('/users/me', data)
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.post('/auth/change-password', {
      currentPassword: oldPassword,
      password: newPassword,
      passwordConfirmation: newPassword,
    })
  }

  // Métodos para manejo local del token
  getAuthToken(): string | null {
    return super.getAuthToken()
  }

  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(APP_CONFIG.TOKEN_KEY, token)
    }
  }

  removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(APP_CONFIG.TOKEN_KEY)
      localStorage.removeItem(APP_CONFIG.USER_KEY)
    }
  }

  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null
    
    const userStr = localStorage.getItem(APP_CONFIG.USER_KEY)
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  setStoredUser(user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(APP_CONFIG.USER_KEY, JSON.stringify(user))
    }
  }
}

export const authService = AuthService.getInstance()
