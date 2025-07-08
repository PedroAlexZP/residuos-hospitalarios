"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AuthContext, ROLE_PERMISSIONS } from "@/lib/auth"
import { authApi } from "@/lib/auth-api"
import type { AuthUser, AuthContextType, RegisterData, UserRole } from "@/lib/auth"

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

function transformStrapiUser(strapiUser: any, jwt: string): AuthUser {
  return {
    id: strapiUser.id.toString(),
    strapiId: strapiUser.id,
    name: strapiUser.profile ? `${strapiUser.profile.firstName} ${strapiUser.profile.lastName}` : strapiUser.username,
    email: strapiUser.email,
    role: strapiUser.role?.type || "generador",
    department: strapiUser.profile?.department || "",
    avatar: strapiUser.profile?.avatar?.url,
    isActive: !strapiUser.blocked,
    createdAt: strapiUser.createdAt,
    updatedAt: strapiUser.updatedAt,
    jwt,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY)
        const savedUser = localStorage.getItem(USER_KEY)

        if (token && savedUser) {
          // Verify token is still valid
          const strapiUser = await authApi.getMe(token)
          const authUser = transformStrapiUser(strapiUser, token)
          setUser(authUser)
        }
      } catch (error) {
        // Token is invalid, clear storage
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        console.error("Auth initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true)
        const response = await authApi.login(email, password)
        const authUser = transformStrapiUser(response.user, response.jwt)

        // Save to localStorage
        localStorage.setItem(TOKEN_KEY, response.jwt)
        localStorage.setItem(USER_KEY, JSON.stringify(authUser))

        setUser(authUser)
        toast.success(`¡Bienvenido, ${authUser.name}!`)
        router.push("/")
      } catch (error: any) {
        console.error("Login error:", error)
        toast.error(error.message || "Error al iniciar sesión")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  const register = useCallback(
    async (userData: RegisterData) => {
      try {
        setIsLoading(true)
        const response = await authApi.register(userData)
        const authUser = transformStrapiUser(response.user, response.jwt)

        // Save to localStorage
        localStorage.setItem(TOKEN_KEY, response.jwt)
        localStorage.setItem(USER_KEY, JSON.stringify(authUser))

        setUser(authUser)
        toast.success("¡Cuenta creada exitosamente!")
        router.push("/")
      } catch (error: any) {
        console.error("Register error:", error)
        toast.error(error.message || "Error al crear cuenta")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
    toast.success("Sesión cerrada")
    router.push("/login")
  }, [router])

  const updateProfile = useCallback(
    async (data: Partial<AuthUser>) => {
      if (!user) return

      try {
        const updatedUser = await authApi.updateProfile(user.jwt, user.strapiId, data)
        const authUser = transformStrapiUser(updatedUser, user.jwt)

        localStorage.setItem(USER_KEY, JSON.stringify(authUser))
        setUser(authUser)
        toast.success("Perfil actualizado")
      } catch (error: any) {
        console.error("Update profile error:", error)
        toast.error(error.message || "Error al actualizar perfil")
        throw error
      }
    },
    [user],
  )

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false
      const rolePermissions = ROLE_PERMISSIONS[user.role] || []
      return rolePermissions.includes(permission)
    },
    [user],
  )

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false
      const roleArray = Array.isArray(roles) ? roles : [roles]
      return roleArray.includes(user.role)
    },
    [user],
  )

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    hasPermission,
    hasRole,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
