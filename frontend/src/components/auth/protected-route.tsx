"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import type { UserRole } from "@/lib/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  requiredPermissions?: string[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, requiredRoles, requiredPermissions, fallback }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasRole, hasPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (user && requiredRoles && !hasRole(requiredRoles)) {
      router.push("/unauthorized")
      return
    }

    if (user && requiredPermissions) {
      const hasAllPermissions = requiredPermissions.every((permission) => hasPermission(permission))
      if (!hasAllPermissions) {
        router.push("/unauthorized")
        return
      }
    }
  }, [user, isLoading, isAuthenticated, hasRole, hasPermission, requiredRoles, requiredPermissions, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
            <p className="text-muted-foreground">No tienes permisos para acceder a esta página</p>
          </div>
        </div>
      )
    )
  }

  if (requiredPermissions) {
    const hasAllPermissions = requiredPermissions.every((permission) => hasPermission(permission))
    if (!hasAllPermissions) {
      return (
        fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">Permisos Insuficientes</h1>
              <p className="text-muted-foreground">No tienes los permisos necesarios para esta acción</p>
            </div>
          </div>
        )
      )
    }
  }

  return <>{children}</>
}
