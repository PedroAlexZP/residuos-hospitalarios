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
    })

    if (error) throw error

    if (data.user) {
      // Wait a moment for the user to be fully registered
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        ...userData,
        email,
        activo: true,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        throw new Error("Error al crear el perfil de usuario. Por favor, inténtalo de nuevo.")
      }

      // If the user is an admin, add them to admin_users table
      if (userData.rol === "admin") {
        const { error: adminError } = await supabase.from("admin_users").insert({
          user_id: data.user.id,
        })

        if (adminError) {
          console.error("Admin user creation error:", adminError)
          // Don't throw error here, just log it
        }
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

    // Verify user profile exists
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
        throw new Error("Tu cuenta está desactivada. Contacta al administrador.")
      }
    }

    return data
  } catch (error: any) {
    console.error("SignIn error:", error)
    throw error
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
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
