"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, FileText, Download, Eye, MoreHorizontal, BarChart3, TrendingUp, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Reporte {
  id: string
  tipo: string
  fecha_generacion: string
  filtros_aplicados: unknown
  archivo_url: string | null
  estado: string
  usuario: {
    nombre_completo: string
    departamento: string
  }
}

const TIPOS_REPORTE = [
  { value: "residuos_generados", label: "Residuos Generados", description: "Reporte de residuos por período" },
  { value: "cumplimiento_normativo", label: "Cumplimiento Normativo", description: "Indicadores de cumplimiento" },
  { value: "entregas_externas", label: "Entregas Externas", description: "Entregas a gestores externos" },
  { value: "incidencias", label: "Incidencias", description: "Reporte de incidencias registradas" },
  { value: "capacitaciones", label: "Capacitaciones", description: "Seguimiento de capacitaciones" },
  { value: "inventario", label: "Inventario", description: "Estado actual del inventario" },
]

export default function ReportesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("all")
  const [filterEstado, setFilterEstado] = useState<string>("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        if (currentUser) {
          await loadReportes(currentUser)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadReportes = async (user: User) => {
    try {
      let query = supabase
        .from("reportes")
        .select(`
          *,
          usuario:users(nombre_completo, departamento)
        `)
        .order("fecha_generacion", { ascending: false })

      // Filtrar por usuario si no es supervisor o admin
      if (!["supervisor", "admin"].includes(user.rol)) {
        query = query.eq("usuario_id", user.id)
      }

      const { data, error } = await query

      if (error) throw error
      setReportes(data || [])
    } catch (error) {
      console.error("Error loading reportes:", error)
    }
  }

  const getTipoReporteInfo = (tipo: string) => {
    return TIPOS_REPORTE.find((t) => t.value === tipo) || { label: tipo, description: "" }
  }

  const getEstadoBadge = (estado: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      generando: "secondary",
      completado: "default",
      error: "destructive",
    }
    return variants[estado] ?? "secondary"
  }

  const filteredReportes = reportes.filter((reporte) => {
    const tipoInfo = getTipoReporteInfo(reporte.tipo)
    const matchesSearch =
      tipoInfo.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reporte.usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = filterTipo === "all" || reporte.tipo === filterTipo
    const matchesEstado = filterEstado === "all" || reporte.estado === filterEstado

    return matchesSearch && matchesTipo && matchesEstado
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted animate-pulse rounded w-48" />
          <div className="h-10 bg-muted animate-pulse rounded w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes y Analytics</h1>
          <p className="text-muted-foreground">Generación de reportes normativos y análisis de datos</p>
        </div>
        {user && ["supervisor", "admin"].includes(user.rol) && (
          <Link href="/reportes/generar">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generar Reporte
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reportes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportes.length}</div>
            <p className="text-xs text-muted-foreground">
              +
              {reportes.filter((r) => new Date(r.fecha_generacion).toDateString() === new Date().toDateString()).length}{" "}
              hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportes.filter((r) => r.estado === "completado").length}</div>
            <p className="text-xs text-muted-foreground">Listos para descarga</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportes.filter((r) => r.estado === "generando").length}</div>
            <p className="text-xs text-muted-foreground">Generándose</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                reportes.filter((r) => {
                  const reporteDate = new Date(r.fecha_generacion)
                  const now = new Date()
                  return reporteDate.getMonth() === now.getMonth() && reporteDate.getFullYear() === now.getFullYear()
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Reportes generados</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Rápidos</CardTitle>
          <CardDescription>Genera reportes comunes con un clic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {TIPOS_REPORTE.slice(0, 6).map((tipo) => (
              <Link key={tipo.value} href={`/reportes/generar?tipo=${tipo.value}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{tipo.label}</div>
                    <div className="text-xs text-muted-foreground">{tipo.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tipo de reporte o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {TIPOS_REPORTE.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="generando">Generando</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || filterTipo !== "all" || filterEstado !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterTipo("all")
                  setFilterEstado("all")
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Generados</CardTitle>
          <CardDescription>
            {filteredReportes.length} de {reportes.length} reportes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Filtros</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead className="w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReportes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No se encontraron reportes.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReportes.map((reporte) => {
                    const tipoInfo = getTipoReporteInfo(reporte.tipo)
                    return (
                      <TableRow key={reporte.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{tipoInfo.label}</div>
                            <div className="text-sm text-muted-foreground">{tipoInfo.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadge(reporte.estado)}>
                            {reporte.estado.charAt(0).toUpperCase() + reporte.estado.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{reporte.usuario.nombre_completo}</div>
                            {reporte.usuario.departamento && (
                              <div className="text-sm text-muted-foreground">{reporte.usuario.departamento}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(reporte.fecha_generacion), "dd/MM/yyyy HH:mm", { locale: es })}
                        </TableCell>
                        <TableCell>
                          {reporte.filtros_aplicados && Object.keys(reporte.filtros_aplicados as Record<string, unknown>).length > 0 ? (
                            <Badge variant="outline">{Object.keys(reporte.filtros_aplicados as Record<string, unknown>).length} filtro(s)</Badge>
                          ) : (
                            <Badge variant="secondary">Sin filtros</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {reporte.archivo_url ? (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Badge variant="secondary">
                              {reporte.estado === "generando" ? "Generando..." : "No disponible"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/reportes/${reporte.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalles
                                </Link>
                              </DropdownMenuItem>
                              {reporte.archivo_url && (
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Descargar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
