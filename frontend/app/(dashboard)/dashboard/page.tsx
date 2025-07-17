"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/hooks/use-language"
import {
  Trash2,
  QrCode,
  Scale,
  Truck,
  AlertTriangle,
  FileText,
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Plus,
  ArrowRight,
  Shield,
  Target,
} from "lucide-react"

interface DashboardStat {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  roles: string[]
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("loadingDashboard")}</p>
        </div>
      </div>
    )
  }

  const stats: DashboardStat[] = [
    {
      title: t("residuosGenerados"),
      value: "1,234 kg",
      change: "+12%",
      trend: "up",
      icon: Trash2,
      color: "text-blue-600",
    },
    {
      title: t("etiquetasEmitidas"),
      value: "156",
      change: "+8%",
      trend: "up", 
      icon: QrCode,
      color: "text-green-600",
    },
    {
      title: t("entregasCompletadas"),
      value: "89",
      change: "+5%",
      trend: "up",
      icon: Truck,
      color: "text-purple-600",
    },
    {
      title: t("incidenciasActivas"),
      value: "3",
      change: "-2",
      trend: "down",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ]

  const quickActions: QuickAction[] = [
    {
      title: t("registrarResiduo"),
      description: t("crearRegistroResiduo"),
      href: "/residuos/nuevo",
      icon: Plus,
      color: "bg-blue-500 hover:bg-blue-600",
      roles: ["generador", "supervisor", "admin"],
    },
    {
      title: t("generarEtiqueta"),
      description: t("crearEtiquetaQR"),
      href: "/etiquetas/generar",
      icon: QrCode,
      color: "bg-green-500 hover:bg-green-600",
      roles: ["generador", "supervisor", "admin"],
    },
    {
      title: t("nuevaEntrega"),
      description: t("programarEntrega"),
      href: "/entregas/nueva",
      icon: Truck,
      color: "bg-purple-500 hover:bg-purple-600",
      roles: ["supervisor", "transportista", "admin"],
    },
    {
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
      title: t("gestionResiduos"),
      description: t("cicloResiduos"),
      href: "/residuos",
      icon: Trash2,
      features: [t("clasificacionCategorias"), t("seguimientoTiempoReal"), t("historialCompleto")],
      status: t("activo"),
    },
    {
      title: t("sistemaEtiquetado"),
      description: t("generacionQR"),
      href: "/etiquetas",
      icon: QrCode,
      features: [t("codigosQRUnicos"), t("infoDetallada"), t("escaneoMovil")],
      status: t("activo"),
    },
    {
      title: t("controlPesaje"),
      description: t("registroPesos"),
      href: "/pesaje",
      icon: Scale,
      features: [t("pesajeAutomatico"), t("validacionDatos"), t("controlCalidad")],
      status: t("activo"),
    },
    {
      title: t("gestionEntregas"),
      description: t("logisticaTransporte"),
      href: "/entregas",
      icon: Truck,
      features: [t("programacionRutas"), t("seguimientoGPS"), t("confirmacionDigital")],
      status: t("activo"),
    },
    {
      title: t("sistemaIncidencias"),
      description: t("gestionEventos"),
      href: "/incidencias",
      icon: AlertTriangle,
      features: [t("alertasAutomaticas"), t("clasificacionPrioridad"), t("seguimientoResolucion")],
      status: t("activo"),
    },
    {
      title: t("reportesCumplimiento"),
      description: t("analisisReportes"),
      href: "/reportes",
      icon: FileText,
      features: [t("dashboardsInteractivos"), t("exportacionMultiple"), t("cumplimientoNormativo")],
      status: t("activo"),
    },
    {
      title: t("capacitaciones"),
      description: t("formacionPersonal"),
      href: "/capacitaciones",
      icon: BookOpen,
      features: [t("cursosInteractivos"), t("certificaciones"), t("seguimientoProgreso")],
      status: t("activo"),
    },
    {
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
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className={`text-xs ${
                    stat.trend === "up" ? "text-green-600" : 
                    stat.trend === "down" ? "text-red-600" : "text-muted-foreground"
                  }`}>
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
            {accessibleActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link key={index} href={action.href}>
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
            {modules.map((module, index) => {
              const Icon = module.icon
              return (
                <div key={index} className="group">
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
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
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
                <span>95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("gestionResiduos")}</span>
                <span>88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("capacitacionPersonal")}</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
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
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">{t("entregaCompletadaLote")}</span>
                <span className="text-xs text-muted-foreground ml-auto">{t("hace2h")}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">{t("nuevoResiduoRegistrado")}</span>
                <span className="text-xs text-muted-foreground ml-auto">{t("hace4h")}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-muted-foreground">{t("incidenciaReportadaSala")}</span>
                <span className="text-xs text-muted-foreground ml-auto">{t("hace6h")}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-muted-foreground">{t("capacitacionCompletada")}</span>
                <span className="text-xs text-muted-foreground ml-auto">{t("hace1d")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
