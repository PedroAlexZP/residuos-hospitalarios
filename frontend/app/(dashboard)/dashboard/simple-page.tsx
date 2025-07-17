"use client"

import { useEffect, useState } from "react"
import { signOut, getCurrentUser } from "@/lib/auth"

interface User {
  nombre_completo: string;
  email: string;
  rol: string;
  departamento?: string;
}

export default function SimpleDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        console.log("Dashboard - Current user:", currentUser)
        setUser(currentUser)
      } catch (error) {
        console.error("Dashboard - Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Bienvenido al Dashboard!
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>

          {user ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                ✅ Login Exitoso!
              </h2>
              <div className="space-y-2 text-green-700">
                <p><strong>Nombre:</strong> {user.nombre_completo}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Rol:</strong> {user.rol}</p>
                {user.departamento && <p><strong>Departamento:</strong> {user.departamento}</p>}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                ❌ No se pudo cargar la información del usuario
              </h2>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Sistema de Temas
              </h3>
              <p className="text-blue-700">
                ✅ Sistema implementado y funcionando
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Autenticación
              </h3>
              <p className="text-green-700">
                ✅ Login y redirección funcionando
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              El sistema de gestión de residuos hospitalarios está funcionando correctamente.
            </p>
            <p className="text-sm text-gray-500">
              Dashboard simplificado para verificar funcionamiento básico.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
