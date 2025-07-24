import { supabase } from "./supabase"

export interface User {
  id: string
  nombre_completo: string
  email: string
  rol: "generador" | "supervisor" | "transportista" | "gestor_externo" | "admin"
  departamento?: string
  activo: boolean
}

// Cache for user data with timestamp
let userCache: { user: User; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

const clearUserCache = () => {
  userCache = null
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('user_profile')
  }
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
  } catch (error: unknown) {
    console.error("SignUp error:", error)

    // Handle specific errors
    if (error instanceof Error && error.message?.includes("rate limit")) {
      throw new Error("Demasiados intentos de registro. Espera un momento antes de intentar de nuevo.")
    }

    if (error instanceof Error && error.message?.includes("User already registered")) {
      throw new Error("Ya existe un usuario con este correo electrónico.")
    }

    throw new Error(error instanceof Error ? error.message : "Error al crear la cuenta")
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

    // Clear any old session storage data to force fresh fetch
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('user_profile')
    }

    return data
  } catch (error: unknown) {
    console.error("SignIn error:", error)
    throw error
  }
}

export const signOut = async () => {
  // Clear caches
  clearUserCache()
  
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  
  // Force redirect to login after sign out
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login'
  }
}

export const getCurrentUser = async (forceRefresh: boolean = false): Promise<User | null> => {
  // Check cache first (unless force refresh)
  if (!forceRefresh && userCache) {
    const now = Date.now()
    if (now - userCache.timestamp < CACHE_DURATION) {
      return userCache.user
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    clearUserCache()
    return null
  }

  try {
    // Check session storage first
    if (!forceRefresh && typeof window !== 'undefined') {
      const cachedProfile = sessionStorage.getItem('user_profile')
      if (cachedProfile) {
        try {
          const parsed = JSON.parse(cachedProfile)
          const userData: User = {
            id: parsed.id,
            email: parsed.email,
            nombre_completo: parsed.nombre_completo || '',
            rol: parsed.rol,
            departamento: parsed.departamento || '',
            activo: parsed.activo
          }
          
          // Update memory cache
          userCache = { user: userData, timestamp: Date.now() }
          return userData
        } catch (parseError) {
          // Invalid cached data, continue to fetch fresh
          console.warn('Invalid cached user data:', parseError)
          sessionStorage.removeItem('user_profile')
        }
      }
    }

    // Fetch from database only when necessary
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      // Fallback to user metadata if database query fails
      const userData: User = {
        id: user.id,
        email: user.email || '',
        nombre_completo: user.user_metadata?.nombre_completo || '',
        rol: user.user_metadata?.rol || 'generador',
        departamento: user.user_metadata?.departamento || '',
        activo: true
      }
      
      // Cache the fallback data
      userCache = { user: userData, timestamp: Date.now() }
      return userData
    }

    const userData: User = {
      id: userProfile.id,
      email: userProfile.email,
      nombre_completo: userProfile.nombre_completo || '',
      rol: userProfile.rol,
      departamento: userProfile.departamento || '',
      activo: userProfile.activo
    }

    // Update both caches
    userCache = { user: userData, timestamp: Date.now() }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('user_profile', JSON.stringify(userProfile))
    }

    return userData
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    
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

// Function to get all users with fallback strategies
export const getAllUsers = async (): Promise<User[]> => {
  try {
    console.log("Attempting to get all users...");
    
    // First attempt: Use our new RPC function
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_all_users_public');

    if (!rpcError && rpcData) {
      console.log("RPC get_all_users_public successful:", rpcData.length, "users");
      return rpcData.map((user: any) => ({
        id: user.id,
        nombre_completo: user.nombre_completo,
        email: user.email,
        rol: user.rol,
        departamento: user.departamento || "Sin asignar",
        activo: user.activo
      }));
    }

    console.error("RPC get_all_users_public failed:", rpcError);

    // Second attempt: direct query
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("activo", true)
      .order("nombre_completo");

    if (!error && data) {
      console.log("Direct query successful:", data.length, "users");
      return data;
    }

    console.error("Direct query failed:", error);

    // Third attempt: try with RPC function from previous implementation
    const { data: oldRpcData, error: oldRpcError } = await supabase
      .rpc('get_all_users_for_admin');

    if (!oldRpcError && oldRpcData) {
      console.log("Old RPC query successful:", oldRpcData.length, "users");
      return oldRpcData.map((user: any) => ({
        id: user.user_id || user.id,
        nombre_completo: user.nombre || user.nombre_completo,
        email: user.email || `${user.nombre?.toLowerCase().replace(/\s+/g, '.')}@hospital.com`,
        rol: user.rol,
        departamento: user.departamento || "Sin asignar",
        activo: true
      }));
    }

    console.error("Old RPC query failed:", oldRpcError);
    
    // Return empty array if all fails
    return [];
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

// Function to get users for specific roles
export const getUsersByRoles = async (roles: string[]): Promise<User[]> => {
  try {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => roles.includes(user.rol));
  } catch (error) {
    console.error("Error getting users by roles:", error);
    return [];
  }
}
