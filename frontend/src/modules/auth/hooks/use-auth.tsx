/**
 * Hook personalizado para autenticación
 */

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService } from '../services/auth.service'
import type { AuthContextValue, AuthUser, LoginCredentials, RegisterData } from '../types'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    // Verificar si hay un usuario almacenado al cargar
    const storedUser = authService.getStoredUser()
    const token = authService.getAuthToken()

    if (storedUser && token) {
      setUser(storedUser)
      // Opcionalmente validar el token con el servidor
      validateToken()
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateToken = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      authService.setStoredUser(currentUser)
    } catch (error) {
      // Token inválido, limpiar datos
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await authService.login(credentials)
      
      authService.setAuthToken(response.token)
      authService.setStoredUser(response.user)
      setUser(response.user)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await authService.register(data)
      
      authService.setAuthToken(response.token)
      authService.setStoredUser(response.user)
      setUser(response.user)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.removeAuthToken()
    setUser(null)
  }

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken()
      
      authService.setAuthToken(response.token)
      authService.setStoredUser(response.user)
      setUser(response.user)
    } catch (error) {
      logout()
      throw error
    }
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
