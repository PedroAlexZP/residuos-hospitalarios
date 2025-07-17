import { supabase } from "./supabase"

export interface User {
  id: string
  nombre_completo: string
  email: string
  rol: "generador" | "supervisor" | "transportista" | "gestor_externo" | "admin"
  departamento?: string
  activo: boolean
}

export const signUp = async (email: string, password: string, userData: Omit<User, "id" | "activo">) => {
  try {
    // Create the user in auth with metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: userData.nombre_completo,
          rol: userData.rol,
          departamento: userData.departamento,
        }
      }
    })

    if (error) throw error

    // Crear perfil en public.users si el usuario fue creado
    if (data.user) {
      const { error: userError } = await supabase.from('users').insert({
        id: data.user.id,
        nombre_completo: userData.nombre_completo,
        email: userData.email,
        rol: userData.rol,
        departamento: userData.departamento,
        activo: true
      })
      if (userError) throw userError
    }

    return data
  } catch (error: any) {
    console.error("SignUp error:", error)

    // Handle specific errors
    if (error.message?.includes("rate limit")) {
      throw new Error("Demasiados intentos de registro. Espera un momento antes de intentar de nuevo.")
    }

    if (error.message?.includes("User already registered")) {
      throw new Error("Ya existe un usuario con este correo electrónico.")
    }

    throw new Error(error.message || "Error al crear la cuenta")
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Handle specific Supabase auth errors
      switch (error.message) {
        case "Invalid login credentials":
          throw new Error("Credenciales inválidas. Verifica tu correo y contraseña.")
        case "Email not confirmed":
          throw new Error("Por favor, confirma tu correo electrónico antes de iniciar sesión.")
        case "Too many requests":
          throw new Error("Demasiados intentos de inicio de sesión. Espera unos minutos antes de intentar de nuevo.")
        case "User not found":
          throw new Error("No existe una cuenta con este correo electrónico.")
        default:
          throw new Error(error.message || "Error al iniciar sesión")
      }
    }

    // Store user info in session storage for quick access
    if (typeof window !== 'undefined' && data.user) {
      const userProfile = {
        id: data.user.id,
        email: data.user.email,
        nombre_completo: data.user.user_metadata?.nombre_completo || '',
        rol: data.user.user_metadata?.rol || 'generador',
        departamento: data.user.user_metadata?.departamento || '',
        activo: true
      }
      sessionStorage.setItem('user_profile', JSON.stringify(userProfile))
    }

    return data
  } catch (error: any) {
    console.error("SignIn error:", error)
    throw error
  }
}

export const signOut = async () => {
  // Clear session storage
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('user_profile')
  }
  
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  
  // Force redirect to login after sign out
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login'
  }
}

export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Try to get from session storage first
  if (typeof window !== 'undefined') {
    const cached = sessionStorage.getItem('user_profile')
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch {
        // If parsing fails, continue to fetch from user metadata
      }
    }
  }

  // Fallback to user metadata
  return {
    id: user.id,
    email: user.email || '',
    nombre_completo: user.user_metadata?.nombre_completo || '',
    rol: user.user_metadata?.rol || 'generador',
    departamento: user.user_metadata?.departamento || '',
    activo: true
  }
}

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) throw error
}

// Helper function to check if current user is admin
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser()
  return user?.rol === 'admin' || false
}
