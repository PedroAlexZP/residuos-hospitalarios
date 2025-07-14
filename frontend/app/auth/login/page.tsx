"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { signIn } from "@/lib/auth"
// import { ThemeToggle } from "@/components/theme-toggle" // Temporarily disabled

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check for error parameters from middleware
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "account_disabled":
          setError("Tu cuenta está desactivada. Contacta al administrador.")
          break
        case "insufficient_permissions":
          setError("No tienes permisos para acceder a esa página.")
          break
        default:
          break
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setSuccess(false)

    try {
      console.log("Starting login with:", formData.email)
      const data = await signIn(formData.email, formData.password)
      console.log("Login successful, data:", data)
      setSuccess(true)
      
      // Immediate redirect without delay for testing
      const returnUrl = searchParams.get("returnUrl") || "/dashboard"
      console.log("Redirecting to:", returnUrl)
      
      // Try immediate redirect
      window.location.replace(returnUrl)
    } catch (error: any) {
      console.error("Login error:", error)
      
      // More specific error messages
      let errorMessage = "Error al iniciar sesión"
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Credenciales inválidas. Verifica tu correo y contraseña."
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirma tu correo electrónico antes de iniciar sesión."
      } else if (error.message?.includes("Too many requests")) {
        errorMessage = "Demasiados intentos. Espera unos minutos antes de intentar de nuevo."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Theme toggle temporarily removed to avoid dependency errors */}
      {/* <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div> */}
      
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-6">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Bienvenido
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sistema de Gestión de Residuos Hospitalarios
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl shadow-lg border border-border bg-card p-8">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg p-4 flex items-start gap-3 bg-destructive/15 border border-destructive/20">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-destructive" />
                <p className="text-sm font-medium text-destructive">
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-lg p-4 flex items-center gap-3 bg-green-500/15 border border-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  ¡Inicio de sesión exitoso! Redirigiendo...
                </p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="usuario@hospital.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
                disabled={loading || success}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={loading || success}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:opacity-70 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || success}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-primary text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  ¡Éxito!
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>

            {/* Links */}
            <div className="space-y-4 text-center">
              <Link
                href="/auth/reset-password"
                className="text-sm transition-colors hover:opacity-70 text-muted-foreground"
              >
                ¿Olvidaste tu contraseña?
              </Link>

              <div className="flex items-center">
                <div className="flex-1 h-px bg-border"></div>
                <span className="px-4 text-xs text-muted-foreground">
                  ¿No tienes cuenta?
                </span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <Link
                href="/auth/register"
                className="text-sm font-medium transition-colors hover:opacity-70 text-primary"
              >
                Crear cuenta nueva
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            © 2025 Sistema de Residuos Hospitalarios. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
