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
import { Plus, Search, AlertTriangle, Eye, Edit, MoreHorizontal, Clock, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { URGENCY_LEVELS } from "@/lib/constants"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useLanguage } from "@/hooks/use-language"

interface Incidencia {
  id: string
  tipo: string
  descripcion: string
  urgencia: string
  estado: string
  fecha: string
  evidencias: unknown
  usuario: {
    nombre_completo: string
    departamento: string
  } | null
  residuo?: {
    id: string
    tipo: string
    ubicacion: string
  }
}

export default function IncidenciasPage() {
  const [user, setUser] = useState<User | null>(null)
  const [incidencias, setIncidencias] = useState<Incidencia[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterUrgencia, setFilterUrgencia] = useState<string>("all")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const { t } = useLanguage()

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        if (currentUser) {
          await loadIncidencias(currentUser)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadIncidencias = async (user: User) => {
    try {
      let query = supabase
        .from("incidencias")
        .select(`
          *,
          usuario:users(nombre_completo, departamento),
          residuo:residuos(id, tipo, ubicacion)
        `)
        .order("fecha", { ascending: false })

      // Filtrar por usuario si no es supervisor o admin
      if (!["supervisor", "admin"].includes(user.rol)) {
        query = query.eq("usuario_id", user.id)
      }

      const { data, error } = await query

      if (error) throw error
      setIncidencias(data || [])
    } catch (error) {
      console.error("Error loading incidencias:", error)
    }
  }

  const getUrgencyInfo = (urgencia: string) => {
    return URGENCY_LEVELS.find((u) => u.value === urgencia) || { label: urgencia, color: "gray" }
  }

  const getEstadoBadge = (estado: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      abierta: "destructive",
      en_proceso: "default",
      resuelta: "secondary",
      cerrada: "outline",
    }
    return variants[estado] ?? "secondary"
  }

  const filteredIncidencias = incidencias.filter((incidencia) => {
    const matchesSearch =
      incidencia.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incidencia.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incidencia.usuario?.nombre_completo || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesUrgencia = filterUrgencia === "all" || incidencia.urgencia === filterUrgencia
    const matchesEstado = filterEstado === "all" || incidencia.estado === filterEstado

    return matchesSearch && matchesUrgencia && matchesEstado
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted animate-pulse rounded w-48" />
          <div className="h-10 bg-muted animate-pulse rounded w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }, () => crypto.randomUUID()).map((id) => (
            <div key={id} className="h-16 bg-muted animate-pulse rounded" />
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
          <h1 className="text-3xl font-bold tracking-tight">{t("gestionIncidencias")}</h1>
          <p className="text-muted-foreground">{t("registroSeguimientoIncidencias")}</p>
        </div>
        {user && ["generador", "supervisor", "admin"].includes(user.rol) && (
          <Link href="/incidencias/nueva">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("nuevaIncidencia")}
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalIncidencias")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidencias.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abiertas</CardTitle>
            <div className="h-2 w-2 bg-red-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidencias.filter((i) => i.estado === "abierta").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidencias.filter((i) => i.estado === "en_proceso").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidencias.filter((i) => i.estado === "resuelta").length}</div>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Buscar por tipo, descripción o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterUrgencia} onValueChange={setFilterUrgencia}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Urgencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las urgencias</SelectItem>
                {URGENCY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
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
                <SelectItem value="abierta">Abierta</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="resuelta">Resuelta</SelectItem>
                <SelectItem value="cerrada">Cerrada</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || filterUrgencia !== "all" || filterEstado !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterUrgencia("all")
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
          <CardTitle>Incidencias Registradas</CardTitle>
          <CardDescription>
            {filteredIncidencias.length} de {incidencias.length} incidencias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Urgencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Evidencias</TableHead>
                  <TableHead className="w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidencias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No se encontraron incidencias.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIncidencias.map((incidencia) => {
                    const urgencyInfo = getUrgencyInfo(incidencia.urgencia)
                    return (
                      <TableRow key={incidencia.id}>
                        <TableCell className="font-medium">{incidencia.tipo}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate" title={incidencia.descripcion}>
                            {incidencia.descripcion}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border-${urgencyInfo.color}-500 text-${urgencyInfo.color}-700`}
                          >
                            {urgencyInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadge(incidencia.estado)}>
                            {incidencia.estado.charAt(0).toUpperCase() + incidencia.estado.slice(1).replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {incidencia.usuario?.nombre_completo || "Usuario no disponible"}
                            </div>
                            {incidencia.usuario?.departamento && (
                              <div className="text-sm text-muted-foreground">{incidencia.usuario.departamento}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(incidencia.fecha), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                        <TableCell>
                          {incidencia.evidencias && Object.keys(incidencia.evidencias).length > 0 ? (
                            <Badge variant="default">{Object.keys(incidencia.evidencias).length} archivo(s)</Badge>
                          ) : (
                            <Badge variant="secondary">Sin evidencias</Badge>
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
                                <Link href={`/incidencias/${incidencia.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("verDetalles")}
                                </Link>
                              </DropdownMenuItem>
                              {user &&
                                (["supervisor", "admin"].includes(user.rol)) && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/incidencias/${incidencia.id}/editar`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </Link>
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
