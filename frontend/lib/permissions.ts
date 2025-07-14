import { supabase } from "./supabase"

export interface Permission {
  rol: string
  modulo: string
  lectura: boolean
  escritura: boolean
  eliminacion: boolean
}

export const getUserPermissions = async (rol: string): Promise<Permission[]> => {
  const { data, error } = await supabase.from("permisos").select("*").eq("rol", rol)

  if (error) {
    console.error("Error fetching permissions:", error)
    return []
  }
  return data || []
}

export const hasPermission = (
  permissions: Permission[],
  modulo: string,
  tipo: "lectura" | "escritura" | "eliminacion",
): boolean => {
  const permission = permissions.find((p) => p.modulo === modulo)
  if (!permission) return false

  return permission[tipo]
}

export const canAccess = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole) || userRole === "admin"
}

// Helper function to check if current user is admin without recursion
export const isAdmin = async (): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data, error } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

  return !error && !!data
}
