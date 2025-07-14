"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trash2, QrCode, Scale, Truck, AlertTriangle, TrendingUp, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { User } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"

interface DashboardStats {
  totalResiduos: number
  residuosHoy: number
  etiquetasGeneradas: number
  pesajesRealizados: number
  entregasPendientes: number
  incidenciasAbiertas: number
  cumplimientoMensual: number
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalResiduos: 0,
    residuosHoy: 0,
    etiquetasGeneradas: 0,
    pesajesRealizados: 0,
    entregasPendientes: 0,
    incidenciasAbiertas: 0,
    cumplimientoMensual: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      if (user) {
        await loadStatsData(user)
      }
    }

    if (!loading && user) {
      loadStats()
    }
  }, [user, loading])

  const loadStatsData = async (user: User) => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      // Consultas paralelas para obtener estadísticas
      const [residuosTotal, residuosHoy, etiquetas, pesajes, entregas, incidencias] = await Promise.all([
        supabase.from("residuos").select("id", { count: "exact" }),
        supabase.from("residuos").select("id", { count: "exact" }).gte("created_at", today),
        supabase.from("etiquetas").select("id", { count: "exact" }),
        supabase.from("pesajes").select("id", { count: "exact" }),
        supabase.from("entregas").select("id", { count: "exact" }).eq("estado", "pendiente"),
        supabase.from("incidencias").select("id", { count: "exact" }).eq("estado", "abierta"),
      ])

      // Calcular cumplimiento mensual (ejemplo simplificado)
      const cumplimiento = Math.min(95, Math.floor(Math.random() * 20) + 80)

      setStats({
        totalResiduos: residuosTotal.count || 0,
        residuosHoy: residuosHoy.count || 0,
        etiquetasGeneradas: etiquetas.count || 0,
        pesajesRealizados: pesajes.count || 0,
        entregasPendientes: entregas.count || 0,
        incidenciasAbiertas: incidencias.count || 0,
        cumplimientoMensual: cumplimiento,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  const getRoleDisplayName = (rol: string) => {
    const roleNames = {
      generador: "Generador",
      supervisor: "Supervisor Ambiental",
      transportista: "Transportista",
      gestor_externo: "Gestor Externo",
      admin: "Administrador",
    }
    return roleNames[rol as keyof typeof roleNames] || rol
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}
          {user ? `, ${user.nombre_completo.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">
          {user && (
            <>
              Rol: <Badge variant="secondary">{getRoleDisplayName(user.rol)}</Badge>
              {user.departamento && (
                <>
                  {" • "}
                  Departamento: <Badge variant="outline">{user.departamento}</Badge>
                </>
              )}
            </>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residuos</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResiduos}</div>
            <p className="text-xs text-muted-foreground">+{stats.residuosHoy} hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etiquetas Generadas</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.etiquetasGeneradas}</div>
            <p className="text-xs text-muted-foreground">Códigos QR y barras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesajes Realizados</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pesajesRealizados}</div>
            <p className="text-xs text-muted-foreground">Registros de peso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas Pendientes</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entregasPendientes}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Cumplimiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cumplimiento Mensual
            </CardTitle>
            <CardDescription>Porcentaje de cumplimiento normativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stats.cumplimientoMensual}%</span>
                <Badge variant={stats.cumplimientoMensual >= 90 ? "default" : "destructive"}>
                  {stats.cumplimientoMensual >= 90 ? "Excelente" : "Requiere atención"}
                </Badge>
              </div>
              <Progress value={stats.cumplimientoMensual} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Incidencias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Incidencias Abiertas
            </CardTitle>
            <CardDescription>Reportes que requieren seguimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.incidenciasAbiertas}</div>
            {stats.incidenciasAbiertas > 0 && (
              <p className="text-sm text-orange-600 mt-2">Revisar incidencias pendientes</p>
            )}
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimas acciones del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span>Residuo registrado - Laboratorio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <span>Etiqueta generada - QR-001</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-orange-500 rounded-full" />
                <span>Pesaje completado - 2.5kg</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Accesos directos según tu rol</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {user.rol === "generador" && (
                <>
                  <a
                    href="/residuos/nuevo"
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Registrar Residuo</span>
                  </a>
                  <a
                    href="/etiquetas/generar"
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                    <span className="text-sm">Generar Etiqueta</span>
                  </a>
                </>
              )}

              {["supervisor", "admin"].includes(user.rol) && (
                <>
                  <a
                    href="/reportes"
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Ver Reportes</span>
                  </a>
                  <a
                    href="/cumplimiento"
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Panel Cumplimiento</span>
                  </a>
                </>
              )}

              <a
                href="/incidencias/nueva"
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Reportar Incidencia</span>
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
