"use client"

import { useState } from "react"
import { signUp } from "@/lib/auth"

export default function TestRegister() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const createTestUser = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const userData = {
        email: "test@hospital.com",
        password: "123456",
        nombre_completo: "Usuario de Prueba",
        rol: "admin" as const,
        departamento: "Administración"
      }

      console.log("Creating test user:", userData)
      
      const result = await signUp(userData.email, userData.password, {
        email: userData.email,
        nombre_completo: userData.nombre_completo,
        rol: userData.rol,
        departamento: userData.departamento
      })

      console.log("Test user created:", result)
      setSuccess(true)
    } catch (error: unknown) {
      console.error("Error creating test user:", error)
      setError((error as Error).message || "Error al crear usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Crear Usuario de Prueba</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                ¡Usuario creado exitosamente!<br/>
                Email: test@hospital.com<br/>
                Password: 123456
              </p>
              <p className="text-sm text-green-600 mt-2">
                Ahora puedes ir al login y usar estas credenciales.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Credenciales de prueba:</h3>
              <p className="text-blue-700 text-sm">
                Email: test@hospital.com<br/>
                Password: 123456<br/>
                Rol: admin
              </p>
            </div>

            <button
              onClick={createTestUser}
              disabled={loading || success}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creando..." : success ? "✅ Usuario Creado" : "Crear Usuario de Prueba"}
            </button>

            <div className="text-center">
              <a
                href="/auth/login"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← Ir al Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
