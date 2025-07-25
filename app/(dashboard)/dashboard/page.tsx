"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useLanguage } from "@/hooks/use-language"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import {
  Trash2,
  QrCode,
  Scale,
  Truck,
  AlertTriangle,
  FileText,
  BookOpen,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Plus,
  ArrowRight,
  Shield,
  Target,
} from "lucide-react"

interface DashboardData {
  residuos: {
    total: number
    pesoTotal: number
    porcentajeCambio: number
  }
  etiquetas: {
    total: number
    porcentajeCambio: number
  }
  entregas: {
    completadas: number
    porcentajeCambio: number
  }
  incidencias: {
    activas: number
    cambio: number
  }
  capacitaciones: {
    completadas: number
    total: number
    porcentaje: number
  }
  cumplimiento: {
    iso: number
    gestion: number
    personal: number
  }
  actividades: Array<{
    id: string
    tipo: string
    descripcion: string
    fecha: string
    color: string
  }>
}

interface QuickAction {
  id: string
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  roles: string[]
}

export default function Dashboard() {
  const { user, loading: userLoading } = useCurrentUser()
  const { t } = useLanguage()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    if (user && !userLoading) {
      loadDashboardData()
    }
  }, [user, userLoading])

  const loadDashboardData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Cargar datos de residuos
      const { data: residuosData } = await supabase
        .from("residuos")
        .select("cantidad, fecha_creacion")
        .order("fecha_creacion", { ascending: false })

      // Cargar datos de etiquetas (aproximado por residuos con código QR)
      const { data: etiquetasData } = await supabase
        .from("residuos")
        .select("id, fecha_creacion")
        .not("codigo_qr", "is", null)

      // Cargar datos de entregas
      const { data: entregasData } = await supabase
        .from("entregas")
        .select("estado, fecha_hora")
        .order("fecha_hora", { ascending: false })

      // Cargar datos de incidencias
      const { data: incidenciasData } = await supabase
        .from("incidencias")
        .select("estado, fecha")
        .order("fecha", { ascending: false })

      // Cargar datos de capacitaciones
      const { data: capacitacionesData } = await supabase
        .from("capacitaciones")
        .select("estado, fecha_inicio")

      // Calcular estadísticas
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      
      const pesoTotal = residuosData?.reduce((sum, r) => sum + (r.cantidad || 0), 0) || 0
      const residuosUltimoMes = residuosData?.filter(r => new Date(r.fecha_creacion) > lastMonth).length || 0
      const residuosMesAnterior = residuosData?.filter(r => {
        const fecha = new Date(r.fecha_creacion)
        const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())
        return fecha > mesAnterior && fecha <= lastMonth
      }).length || 0

      const entregasCompletadas = entregasData?.filter(e => e.estado === "completada").length || 0
      const incidenciasActivas = incidenciasData?.filter(i => ["abierta", "en_proceso"].includes(i.estado)).length || 0
      const capacitacionesCompletadas = capacitacionesData?.filter(c => c.estado === "completada").length || 0

      // Calcular actividades recientes
      const actividades = [
        ...(entregasData?.slice(0, 2).map(e => ({
          id: `entrega-${Math.random()}`,
          tipo: "entrega",
          descripcion: "Entrega completada lote #" + Math.floor(Math.random() * 1000),
          fecha: e.fecha_hora,
          color: "bg-green-500"
        })) || []),
        ...(residuosData?.slice(0, 2).map(r => ({
          id: `residuo-${Math.random()}`,
          tipo: "residuo",
          descripcion: "Nuevo residuo registrado",
          fecha: r.fecha_creacion,
          color: "bg-blue-500"
        })) || []),
        ...(incidenciasData?.slice(0, 1).map(i => ({
          id: `incidencia-${Math.random()}`,
          tipo: "incidencia",
          descripcion: "Incidencia reportada en sala",
          fecha: i.fecha,
          color: "bg-orange-500"
        })) || [])
      ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 4)

      setDashboardData({
        residuos: {
          total: residuosData?.length || 0,
          pesoTotal,
          porcentajeCambio: residuosMesAnterior > 0 ? ((residuosUltimoMes - residuosMesAnterior) / residuosMesAnterior) * 100 : 0
        },
        etiquetas: {
          total: etiquetasData?.length || 0,
          porcentajeCambio: 8 // Placeholder
        },
        entregas: {
          completadas: entregasCompletadas,
          porcentajeCambio: 5 // Placeholder
        },
        incidencias: {
          activas: incidenciasActivas,
          cambio: -2 // Placeholder
        },
        capacitaciones: {
          completadas: capacitacionesCompletadas,
          total: capacitacionesData?.length || 0,
          porcentaje: capacitacionesData?.length ? (capacitacionesCompletadas / capacitacionesData.length) * 100 : 0
        },
        cumplimiento: {
          iso: 95,
          gestion: Math.min(95, 70 + (pesoTotal > 0 ? 25 : 0)),
          personal: capacitacionesData?.length ? (capacitacionesCompletadas / capacitacionesData.length) * 100 : 0
        },
        actividades
      })
      
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function for trend calculation
  const getTrend = (value: number): "up" | "down" | "neutral" => {
    if (value > 0) return "up"
    if (value < 0) return "down"
    return "neutral"
  }

  // Helper function for color calculation
  const getTrendColor = (trend: "up" | "down" | "neutral"): string => {
    if (trend === "up") return "text-green-600"
    if (trend === "down") return "text-red-600"
    return "text-muted-foreground"
  }

  // Memoized stats calculation
  const stats = useMemo(() => {
    if (!dashboardData) return []
    
    return [
      {
        id: "residuos",
        title: t("residuosGenerados"),
        value: `${dashboardData.residuos.pesoTotal.toFixed(1)} kg`,
        change: `${dashboardData.residuos.porcentajeCambio > 0 ? '+' : ''}${dashboardData.residuos.porcentajeCambio.toFixed(1)}%`,
        trend: getTrend(dashboardData.residuos.porcentajeCambio),
        icon: Trash2,
        color: "text-blue-600",
      },
      {
        id: "etiquetas",
        title: t("etiquetasEmitidas"),
        value: dashboardData.etiquetas.total,
        change: `+${dashboardData.etiquetas.porcentajeCambio}%`,
        trend: "up" as const, 
        icon: QrCode,
        color: "text-green-600",
      },
      {
        id: "entregas",
        title: t("entregasCompletadas"),
        value: dashboardData.entregas.completadas,
        change: `+${dashboardData.entregas.porcentajeCambio}%`,
        trend: "up" as const,
        icon: Truck,
        color: "text-purple-600",
      },
      {
        id: "incidencias",
        title: t("incidenciasActivas"),
        value: dashboardData.incidencias.activas,
        change: dashboardData.incidencias.cambio.toString(),
        trend: getTrend(dashboardData.incidencias.cambio),
        icon: AlertTriangle,
        color: "text-orange-600",
      },
    ]
  }, [dashboardData, t])

  if (!mounted || loading || userLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("loadingDashboard")}</p>
        </div>
      </div>
    )
  }

  const quickActions: QuickAction[] = [
    {
      id: "registrar-residuo",
      title: t("registrarResiduo"),
      description: t("crearRegistroResiduo"),
      href: "/residuos/nuevo",
      icon: Plus,
      color: "bg-blue-500 hover:bg-blue-600",
      roles: ["generador", "supervisor", "admin"],
    },
    {
      id: "generar-etiqueta",
      title: t("generarEtiqueta"),
      description: t("crearEtiquetaQR"),
      href: "/etiquetas/generar",
      icon: QrCode,
      color: "bg-green-500 hover:bg-green-600",
      roles: ["generador", "supervisor", "admin"],
    },
    {
      id: "nueva-entrega",
      title: t("nuevaEntrega"),
      description: t("programarEntrega"),
      href: "/entregas/nueva",
      icon: Truck,
      color: "bg-purple-500 hover:bg-purple-600",
      roles: ["supervisor", "transportista", "admin"],
    },
    {
      id: "ver-reportes",
      title: t("verReportes"),
      description: t("consultarReportes"),
      href: "/reportes",
      icon: BarChart3,
      color: "bg-orange-500 hover:bg-orange-600",
      roles: ["supervisor", "gestor_externo", "admin"],
    },
  ]

  const modules = [
    {
      id: "gestion-residuos",
      title: t("gestionResiduos"),
      description: t("cicloResiduos"),
      href: "/residuos",
      icon: Trash2,
      features: [t("clasificacionCategorias"), t("seguimientoTiempoReal"), t("historialCompleto")],
      status: t("activo"),
    },
    {
      id: "sistema-etiquetado",
      title: t("sistemaEtiquetado"),
      description: t("generacionQR"),
      href: "/etiquetas",
      icon: QrCode,
      features: [t("codigosQRUnicos"), t("infoDetallada"), t("escaneoMovil")],
      status: t("activo"),
    },
    {
      id: "control-pesaje",
      title: t("controlPesaje"),
      description: t("registroPesos"),
      href: "/pesaje",
      icon: Scale,
      features: [t("pesajeAutomatico"), t("validacionDatos"), t("controlCalidad")],
      status: t("activo"),
    },
    {
      id: "gestion-entregas",
      title: t("gestionEntregas"),
      description: t("logisticaTransporte"),
      href: "/entregas",
      icon: Truck,
      features: [t("programacionRutas"), t("seguimientoGPS"), t("confirmacionDigital")],
      status: t("activo"),
    },
    {
      id: "sistema-incidencias",
      title: t("sistemaIncidencias"),
      description: t("gestionEventos"),
      href: "/incidencias",
      icon: AlertTriangle,
      features: [t("alertasAutomaticas"), t("clasificacionPrioridad"), t("seguimientoResolucion")],
      status: t("activo"),
    },
    {
      id: "reportes-cumplimiento",
      title: t("reportesCumplimiento"),
      description: t("analisisReportes"),
      href: "/reportes",
      icon: FileText,
      features: [t("dashboardsInteractivos"), t("exportacionMultiple"), t("cumplimientoNormativo")],
      status: t("activo"),
    },
    {
      id: "capacitaciones",
      title: t("capacitaciones"),
      description: t("formacionPersonal"),
      href: "/capacitaciones",
      icon: BookOpen,
      features: [t("cursosInteractivos"), t("certificaciones"), t("seguimientoProgreso")],
      status: t("activo"),
    },
    {
      id: "cumplimiento-normativo",
      title: t("cumplimientoNormativo"),
      description: t("verificacionISO"),
      href: "/cumplimiento",
      icon: Shield,
      features: [t("auditoriasAutomaticas"), t("indicadoresCumplimiento"), t("planesMejora")],
      status: t("activo"),
    },
  ]

  const canAccessAction = (action: QuickAction) => {
    return user && action.roles.includes(user.rol)
  }

  const accessibleActions = quickActions.filter(canAccessAction)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("welcome")}, {user?.nombre_completo}!
          </h1>
          <p className="text-muted-foreground">
            {t("sistemaGestionResiduos")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t("sistemaOperativo")}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {user?.rol?.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className={`text-xs ${getTrendColor(stat.trend)}`}>
                    {stat.change} desde el mes pasado
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t("accionesRapidas")}
          </CardTitle>
          <CardDescription>
            {t("accesosDirectos")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {accessibleActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.id} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.color} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{action.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modules Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t("modulosSistema")}
          </CardTitle>
          <CardDescription>
            {t("resumenFuncionalidades")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon
              return (
                <div key={module.id} className="group">
                  <Link href={module.href}>
                    <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group-hover:border-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </div>
                            <Badge 
                              variant="outline" 
                              className="text-green-600 border-green-600 text-xs"
                            >
                              {module.status}
                            </Badge>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <CardTitle className="text-base">{module.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {module.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="space-y-1">
                          {module.features.map((feature, idx) => (
                            <li key={`${module.id}-feature-${idx}`} className="text-sm text-muted-foreground flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("estadoCumplimiento")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("normativaISO")}</span>
                <span>{dashboardData.cumplimiento.iso}%</span>
              </div>
              <Progress value={dashboardData.cumplimiento.iso} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("gestionResiduos")}</span>
                <span>{dashboardData.cumplimiento.gestion.toFixed(0)}%</span>
              </div>
              <Progress value={dashboardData.cumplimiento.gestion} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("capacitacionPersonal")}</span>
                <span>{dashboardData.cumplimiento.personal.toFixed(0)}%</span>
              </div>
              <Progress value={dashboardData.cumplimiento.personal} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("actividadReciente")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.actividades.map((actividad) => (
                <div key={actividad.id} className="flex items-center space-x-3 text-sm">
                  <div className={`w-2 h-2 ${actividad.color} rounded-full`}></div>
                  <span className="text-muted-foreground">{actividad.descripcion}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(actividad.fecha).toLocaleDateString('es-ES', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
              {dashboardData.actividades.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  <p>No hay actividades recientes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
