import type { StrapiAuthResponse, StrapiUser, RegisterData } from "./auth"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"

class AuthApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any,
  ) {
    super(message)
    this.name = "AuthApiError"
  }
}

async function authRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${STRAPI_URL}/api${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new AuthApiError(response.status, data.error?.message || "Authentication error", data.error?.details)
    }

    return data
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error
    }
    throw new AuthApiError(500, "Network error occurred")
  }
}

export const authApi = {
  async login(email: string, password: string): Promise<StrapiAuthResponse> {
    return authRequest<StrapiAuthResponse>("/auth/local", {
      method: "POST",
      body: JSON.stringify({
        identifier: email,
        password,
      }),
    })
  },

  async register(userData: RegisterData): Promise<StrapiAuthResponse> {
    return authRequest<StrapiAuthResponse>("/auth/local/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  async getMe(jwt: string): Promise<StrapiUser> {
    return authRequest<StrapiUser>("/users/me?populate=*", {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
  },

  async updateProfile(jwt: string, userId: number, data: any): Promise<StrapiUser> {
    return authRequest<StrapiUser>(`/users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(data),
    })
  },

  async forgotPassword(email: string): Promise<{ ok: boolean }> {
    return authRequest<{ ok: boolean }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  async resetPassword(code: string, password: string, passwordConfirmation: string): Promise<StrapiAuthResponse> {
    return authRequest<StrapiAuthResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        code,
        password,
        passwordConfirmation,
      }),
    })
  },
}
