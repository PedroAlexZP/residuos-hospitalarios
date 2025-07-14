"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock, FileText, Users, Scale } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"

interface CumplimientoData {
  residuosGenerados: number
  residuosEntregados: number
  incidenciasAbiertas: number
  capacitacionesCompletadas: number
  totalCapacitaciones: number
  pesajesRealizados: number
  diferenciasAltas: number
  entregasPendientes: number
  cumplimientoGeneral: number
}

export default function CumplimientoPage() {
  const [user, setUser] = useState<User | null>(null)
  const [data, setData] = useState<CumplimientoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        if (currentUser) {
          await loadCumplimientoData()
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadCumplimientoData = async () => {
    try {
      // Obtener datos de diferentes tablas
      const [residuosResult, incidenciasResult, capacitacionesResult, pesajesResult, entregasResult] =
        await Promise.all([
          supabase.from("residuos").select("id, estado"),
          supabase.from("incidencias").select("id, estado"),
          supabase.from("capacitaciones").select("id, capacitacion_participantes(asistio)"),
          supabase.from("pesajes").select("peso, residuo:residuos(cantidad)"),
          supabase.from("entregas").select("id, estado"),
        ])

      const residuos = residuosResult.data || []
      const incidencias = incidenciasResult.data || []
      const capacitaciones = capacitacionesResult.data || []
      const pesajes = pesajesResult.data || []
      const entregas = entregasResult.data || []

      // Calcular métricas
      const residuosGenerados = residuos.length
      const residuosEntregados = residuos.filter((r) => r.estado === "entregado").length
      const incidenciasAbiertas = incidencias.filter((i) => i.estado === "abierta").length

      const totalCapacitaciones = capacitaciones.length
      const capacitacionesCompletadas = capacitaciones.filter((c) =>
        c.capacitacion_participantes.some((p) => p.asistio),
      ).length

      const pesajesRealizados = pesajes.length
      const diferenciasAltas = pesajes.filter((p) => {
        if (!p.residuo) return false
        const diferencia = Math.abs(p.peso - p.residuo.cantidad)
        return (diferencia / p.residuo.cantidad) * 100 > 10
      }).length

      const entregasPendientes = entregas.filter((e) => e.estado === "pendiente").length

      // Calcular cumplimiento general (ejemplo simplificado)
      let cumplimientoGeneral = 100

      // Penalizar por incidencias abiertas
      if (incidenciasAbiertas > 0) {
        cumplimientoGeneral -= Math.min(incidenciasAbiertas * 5, 20)
      }

      // Penalizar por diferencias altas en pesajes
      if (pesajesRealizados > 0) {
        const porcentajeDiferencias = (diferenciasAltas / pesajesRealizados) * 100
        cumplimientoGeneral -= Math.min(porcentajeDiferencias, 15)
      }

      // Penalizar por entregas pendientes
      if (entregasPendientes > 0) {
        cumplimientoGeneral -= Math.min(entregasPendientes * 3, 10)
      }

      // Bonificar por capacitaciones completadas
      if (totalCapacitaciones > 0) {
        const porcentajeCapacitaciones = (capacitacionesCompletadas / totalCapacitaciones) * 100
        if (porcentajeCapacitaciones >= 80) {
          cumplimientoGeneral += 5
        }
      }

      cumplimientoGeneral = Math.max(0, Math.min(100, cumplimientoGeneral))

      setData({
        residuosGenerados,
        residuosEntregados,
        incidenciasAbiertas,
        capacitacionesCompletadas,
        totalCapacitaciones,
        pesajesRealizados,
        diferenciasAltas,
        entregasPendientes,
        cumplimientoGeneral,
      })
    } catch (error) {
      console.error("Error loading cumplimiento data:", error)
    }
  }

  const getCumplimientoBadge = (porcentaje: number) => {
    if (porcentaje >= 90) return { variant: "default" as const, label: "Excelente", color: "text-green-700" }
    if (porcentaje >= 80) return { variant: "secondary" as const, label: "Bueno", color: "text-blue-700" }
    if (porcentaje >= 70) return { variant: "secondary" as const, label: "Regular", color: "text-yellow-700" }
    return { variant: "destructive" as const, label: "Crítico", color: "text-red-700" }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No se pudieron cargar los datos de cumplimiento</p>
      </div>
    )
  }

  const cumplimientoBadge = getCumplimientoBadge(data.cumplimientoGeneral)
  const porcentajeEntregas = data.residuosGenerados > 0 ? (data.residuosEntregados / data.residuosGenerados) * 100 : 0
  const porcentajeCapacitaciones =
    data.totalCapacitaciones > 0 ? (data.capacitacionesCompletadas / data.totalCapacitaciones) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Cumplimiento</h1>
        <p className="text-muted-foreground">Monitoreo de cumplimiento normativo y KPIs del sistema</p>
      </div>

      {/* Cumplimiento General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cumplimiento General
          </CardTitle>
          <CardDescription>Indicador global de cumplimiento normativo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <div className="text-3xl font-bold">{data.cumplimientoGeneral.toFixed(1)}%</div>
              <Badge variant={cumplimientoBadge.variant} className={cumplimientoBadge.color}>
                {cumplimientoBadge.label}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Meta: ≥90%</div>
              <div className="text-sm text-muted-foreground">Mínimo: ≥70%</div>
            </div>
          </div>
          <Progress value={data.cumplimientoGeneral} className="h-3" />
        </CardContent>
      </Card>

      {/* Alerts */}
      {data.cumplimientoGeneral < 80 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            El cumplimiento normativo está por debajo del nivel recomendado. Revisa las incidencias abiertas y asegúrate
            de completar las entregas pendientes.
          </AlertDescription>
        </Alert>
      )}

      {data.incidenciasAbiertas > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Hay {data.incidenciasAbiertas} incidencia(s) abierta(s) que requieren atención inmediata.
          </AlertDescription>
        </Alert>
      )}

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestión de Residuos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{porcentajeEntregas.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.residuosEntregados} de {data.residuosGenerados} entregados
            </p>
            <Progress value={porcentajeEntregas} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidencias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.incidenciasAbiertas}</div>
            <p className="text-xs text-muted-foreground">Incidencias abiertas</p>
            <Badge variant={data.incidenciasAbiertas === 0 ? "default" : "destructive"} className="mt-2">
              {data.incidenciasAbiertas === 0 ? "Sin incidencias" : "Requiere atención"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacitaciones</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{porcentajeCapacitaciones.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.capacitacionesCompletadas} de {data.totalCapacitaciones} completadas
            </p>
            <Progress value={porcentajeCapacitaciones} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisión Pesaje</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.pesajesRealizados > 0
                ? (100 - (data.diferenciasAltas / data.pesajesRealizados) * 100).toFixed(1)
                : 100}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {data.diferenciasAltas} diferencias altas de {data.pesajesRealizados}
            </p>
            <Badge variant={data.diferenciasAltas === 0 ? "default" : "secondary"} className="mt-2">
              {data.diferenciasAltas === 0 ? "Excelente" : "Revisar calibración"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Proceso de Residuos */}
        <Card>
          <CardHeader>
            <CardTitle>Flujo de Residuos</CardTitle>
            <CardDescription>Estado actual del proceso de gestión</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Residuos Generados</span>
              <Badge variant="outline">{data.residuosGenerados}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pesajes Realizados</span>
              <Badge variant="outline">{data.pesajesRealizados}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Entregas Completadas</span>
              <Badge variant="outline">{data.residuosEntregados}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Entregas Pendientes</span>
              <Badge variant={data.entregasPendientes > 0 ? "destructive" : "default"}>{data.entregasPendientes}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores de Calidad */}
        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Calidad</CardTitle>
            <CardDescription>Métricas de calidad del proceso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Trazabilidad Completa</span>
                <Badge variant="default">
                  {data.residuosGenerados > 0
                    ? ((data.pesajesRealizados / data.residuosGenerados) * 100).toFixed(1)
                    : 0}
                  %
                </Badge>
              </div>
              <Progress
                value={data.residuosGenerados > 0 ? (data.pesajesRealizados / data.residuosGenerados) * 100 : 0}
                className="h-1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Precisión de Pesaje</span>
                <Badge variant="default">
                  {data.pesajesRealizados > 0
                    ? (100 - (data.diferenciasAltas / data.pesajesRealizados) * 100).toFixed(1)
                    : 100}
                  %
                </Badge>
              </div>
              <Progress
                value={data.pesajesRealizados > 0 ? 100 - (data.diferenciasAltas / data.pesajesRealizados) * 100 : 100}
                className="h-1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Capacitación del Personal</span>
                <Badge variant="default">{porcentajeCapacitaciones.toFixed(1)}%</Badge>
              </div>
              <Progress value={porcentajeCapacitaciones} className="h-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recomendaciones para Mejorar el Cumplimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.incidenciasAbiertas > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Resolver Incidencias Abiertas</p>
                  <p className="text-sm text-red-700">
                    Hay {data.incidenciasAbiertas} incidencia(s) que requieren atención inmediata para mejorar el
                    cumplimiento.
                  </p>
                </div>
              </div>
            )}

            {data.entregasPendientes > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Completar Entregas Pendientes</p>
                  <p className="text-sm text-yellow-700">
                    {data.entregasPendientes} entrega(s) pendiente(s) de confirmación por gestores externos.
                  </p>
                </div>
              </div>
            )}

            {porcentajeCapacitaciones < 80 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Incrementar Capacitaciones</p>
                  <p className="text-sm text-blue-700">
                    Solo el {porcentajeCapacitaciones.toFixed(1)}% de las capacitaciones han sido completadas. Meta
                    recomendada: 80%.
                  </p>
                </div>
              </div>
            )}

            {data.diferenciasAltas > 0 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Scale className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">Revisar Calibración de Básculas</p>
                  <p className="text-sm text-orange-700">
                    {data.diferenciasAltas} pesaje(s) con diferencias superiores al 10%. Verificar calibración de
                    equipos.
                  </p>
                </div>
              </div>
            )}

            {data.cumplimientoGeneral >= 90 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Excelente Cumplimiento</p>
                  <p className="text-sm text-green-700">
                    El sistema mantiene un nivel excelente de cumplimiento normativo. Continúa con las buenas prácticas.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
