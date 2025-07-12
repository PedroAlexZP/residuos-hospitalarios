"use client"

import { createContext, useContext } from "react"
import type { User, UserRole } from "./types"

// Re-export UserRole for easier access
export type { UserRole } from "./types"

// Strapi Auth Types
export interface StrapiAuthResponse {
  jwt: string
  user: StrapiUser
}

export interface StrapiUser {
  id: number
  username: string
  email: string
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  role: {
    id: number
    name: string
    description: string
    type: UserRole
  }
  profile?: {
    firstName: string
    lastName: string
    department: string
    phone: string
    avatar?: {
      url: string
    }
  }
}

export interface AuthUser extends User {
  jwt: string
  strapiId: number
}

export interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<AuthUser>) => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  department: string
  phone: string
  role: UserRole
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Permission system
export const PERMISSIONS = {
  // User management
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  EDIT_USERS: "edit_users",
  DELETE_USERS: "delete_users",

  // Waste management
  CREATE_WASTE: "create_waste",
  VIEW_WASTE: "view_waste",
  EDIT_WASTE: "edit_waste",
  DELETE_WASTE: "delete_waste",

  // Collections
  CREATE_COLLECTION: "create_collection",
  VIEW_COLLECTION: "view_collection",
  EDIT_COLLECTION: "edit_collection",

  // Reports
  VIEW_REPORTS: "view_reports",
  CREATE_REPORTS: "create_reports",
  EXPORT_REPORTS: "export_reports",

  // System admin
  SYSTEM_CONFIG: "system_config",
  MANAGE_PERMISSIONS: "manage_permissions",
  VIEW_AUDIT_LOGS: "view_audit_logs",
} as const

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  generador: [PERMISSIONS.CREATE_WASTE, PERMISSIONS.VIEW_WASTE, PERMISSIONS.EDIT_WASTE],
  supervisor: [
    PERMISSIONS.VIEW_WASTE,
    PERMISSIONS.EDIT_WASTE,
    PERMISSIONS.CREATE_COLLECTION,
    PERMISSIONS.VIEW_COLLECTION,
    PERMISSIONS.EDIT_COLLECTION,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_REPORTS,
  ],
  transportista: [PERMISSIONS.VIEW_WASTE, PERMISSIONS.VIEW_COLLECTION, PERMISSIONS.EDIT_COLLECTION],
  gestor_externo: [
    PERMISSIONS.VIEW_WASTE,
    PERMISSIONS.VIEW_COLLECTION,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
  ],
  administrador: [...Object.values(PERMISSIONS)],
}
