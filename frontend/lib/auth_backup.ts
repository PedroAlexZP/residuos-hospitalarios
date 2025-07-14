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
    // First create the user in auth
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

    // For now, we'll just return the auth data
    // The user profile will be created via database triggers or manually later
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

    return data
  } catch (error: any) {
    console.error("SignUp error:", error)

    // Handle specific errors
    if (error.message?.includes("rate limit")) {
      throw new Error("Demasiados intentos de registro. Espera un momento antes de intentar de nuevo.")
    }

    if (error.code === "42501") {
      throw new Error("Error de permisos. Por favor, contacta al administrador del sistema.")
    }

    if (error.message?.includes("duplicate key")) {
      throw new Error("Ya existe un usuario con este correo electrónico.")
    }

    throw error
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

    // Verify user profile exists and is active
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError || !profile) {
        console.error("Profile verification error:", profileError)
        throw new Error("Error al verificar el perfil de usuario. Contacta al administrador.")
      }

      // Check if user is active
      if (!profile.activo) {
        // Sign out the user if account is disabled
        await supabase.auth.signOut()
        throw new Error("Tu cuenta está desactivada. Contacta al administrador.")
      }

      // Store user info in session storage for quick access
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('user_profile', JSON.stringify(profile))
      }
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

  const { data: profile, error } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return profile
}

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) throw error
}

// Helper function to check if current user is admin
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data, error } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

  return !error && !!data
}
