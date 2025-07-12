// Configuración de API y funciones base mejoradas con autenticación
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337/api"

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getAuthToken()

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (response.status === 401) {
      // Token expired or invalid, redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        window.location.href = "/login"
      }
      throw new ApiError(401, "Authentication required")
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        response.status,
        errorData.error?.message || `HTTP error! status: ${response.status}`,
        errorData.error?.details,
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, "Network error occurred")
  }
}

// Generic CRUD operations with better error handling
export const createEntity = async <T>(endpoint: string, data: Partial<T>): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: JSON.stringify({ data }),
  })
}

export const getEntity = async <T>(endpoint: string, id: string): Promise<T> => {
  return apiRequest<T>(`${endpoint}/${id}?populate=*`)
}

export const getEntities = async <T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T[]> => {
  const searchParams = params ? `?${new URLSearchParams(params)}&populate=*` : "?populate=*"
  const response = await apiRequest<{ data: T[] }>(`${endpoint}${searchParams}`)
  return response.data || []
}

export const updateEntity = async <T>(
  endpoint: string,
  id: string,
  data: Partial<T>
): Promise<T> => {
  return apiRequest<T>(`${endpoint}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  })
}

export const deleteEntity = async (endpoint: string, id: string): Promise<void> => {
  return apiRequest<void>(`${endpoint}/${id}`, {
    method: "DELETE",
  })
}

// Bulk operations
export const bulkCreate = async <T>(endpoint: string, items: Partial<T>[]): Promise<T[]> => {
  return apiRequest<T[]>(`${endpoint}/bulk`, {
    method: "POST",
    body: JSON.stringify({ data: items }),
  })
}

export const bulkUpdate = async <T>(
  endpoint: string,
  updates: { id: string; data: Partial<T> }[]
): Promise<T[]> => {
  return apiRequest<T[]>(`${endpoint}/bulk`, {
    method: "PUT",
    body: JSON.stringify({ updates }),
  })
}

export const bulkDelete = async (endpoint: string, ids: string[]): Promise<void> => {
  return apiRequest<void>(`${endpoint}/bulk`, {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  })
}
