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
import { Progress } from "@/components/ui/progress"
import { Search, BookOpen, Users, Eye, MoreHorizontal, Calendar, Award, Clock, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Capacitacion {
  id: string
  tema: string
  fecha: string
  descripcion: string
  material_pdf: string | null
  created_at: string
  responsable: {
    nombre_completo: string
    departamento: string
  } | null
  capacitacion_participantes: {
    id: string
    asistio: boolean
    calificacion: number | null
    usuario: {
      nombre_completo: string
      departamento: string
    }
  }[]
}

export default function CapacitacionesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterFecha, setFilterFecha] = useState<string>("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        if (currentUser) {
          await loadCapacitaciones(currentUser)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadCapacitaciones = async (user: User) => {
    try {
      console.log("Loading capacitaciones for user:", user.rol);
      
      // First attempt: Use our new RPC function that bypasses RLS
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_capacitaciones_with_responsables');

      if (!rpcError && rpcData) {
        console.log("RPC get_capacitaciones_with_responsables successful:", rpcData.length, "capacitaciones");
        
        // Transform RPC data to expected format
        const transformedData = rpcData.map((capacitacion: any) => ({
          id: capacitacion.id,
          tema: capacitacion.tema,
          fecha: capacitacion.fecha,
          descripcion: capacitacion.descripcion,
          material_pdf: capacitacion.material_pdf,
          created_at: capacitacion.created_at,
          responsable: capacitacion.responsable_nombre ? {
            nombre_completo: capacitacion.responsable_nombre,
            departamento: capacitacion.responsable_departamento
          } : null,
          capacitacion_participantes: [] // We'll load these separately if needed
        }));
        
        console.log("Capacitaciones with responsables:", transformedData.filter((c: any) => c.responsable).length);
        setCapacitaciones(transformedData);
        return;
      }

      console.error("RPC get_capacitaciones_with_responsables failed:", rpcError);

      // Fallback: original query with JOIN
      const query = supabase
        .from("capacitaciones")
        .select(`
          *,
          responsable:users(nombre_completo, departamento),
          capacitacion_participantes(
            id,
            asistio,
            calificacion,
            usuario:users(nombre_completo, departamento)
          )
        `)
        .order("fecha", { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error("Error loading capacitaciones with JOIN:", error);
        
        // Second fallback: cargar capacitaciones sin join
        console.log("Intentando segundo fallback sin join...");
        const { data: capacitacionesData, error: capacitacionesError } = await supabase
          .from("capacitaciones")
          .select("*")
          .order("fecha", { ascending: false });
          
        if (capacitacionesError) {
          throw capacitacionesError;
        }
        
        // Cargar usuarios por separado
        const { data: usuariosData } = await supabase
          .from("users")
          .select("id, nombre_completo, departamento");
          
        // Mapear responsables a capacitaciones
        const capacitacionesWithUsers = capacitacionesData?.map(capacitacion => ({
          ...capacitacion,
          responsable: usuariosData?.find(u => u.id === capacitacion.responsable_id) || null,
          capacitacion_participantes: []
        })) || [];
        
        console.log("Second fallback - Capacitaciones cargadas:", capacitacionesWithUsers.length);
        console.log("Second fallback - Capacitaciones with responsables:", capacitacionesWithUsers.filter((c: any) => c.responsable).length);
        setCapacitaciones(capacitacionesWithUsers);
        return;
      }
      
      console.log("JOIN query successful - Capacitaciones cargadas:", data?.length || 0);
      setCapacitaciones(data || [])
    } catch (error) {
      console.error("Error loading capacitaciones:", error)
      setCapacitaciones([]);
    }
  }

  const getAsistenciaStats = (capacitacion: Capacitacion) => {
    const total = capacitacion.capacitacion_participantes.length
    const asistieron = capacitacion.capacitacion_participantes.filter((p) => p.asistio).length
    const porcentaje = total > 0 ? (asistieron / total) * 100 : 0
    return { total, asistieron, porcentaje }
  }

  const getAsistenciaBadgeVariant = (porcentaje: number) => {
    if (porcentaje >= 80) return "default"
    if (porcentaje >= 60) return "secondary"
    return "destructive"
  }

  const getCalificacionBadgeVariant = (promedio: number) => {
    if (promedio >= 80) return "default"
    if (promedio >= 60) return "secondary"
    return "destructive"
  }

  const getCalificacionLabel = (promedio: number) => {
    if (promedio >= 80) return "Excelente"
    if (promedio >= 60) return "Bueno"
    return "Mejorar"
  }

  const getCalificacionPromedio = (capacitacion: Capacitacion) => {
    const calificaciones = capacitacion.capacitacion_participantes
      .filter((p) => p.asistio && p.calificacion !== null)
      .map((p) => p.calificacion!)

    if (calificaciones.length === 0) return null
    return calificaciones.reduce((sum, cal) => sum + cal, 0) / calificaciones.length
  }

  const filteredCapacitaciones = capacitaciones.filter((capacitacion) => {
    const matchesSearch =
      capacitacion.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (capacitacion.responsable?.nombre_completo || "").toLowerCase().includes(searchTerm.toLowerCase())

    let matchesFecha = true
    if (filterFecha !== "all") {
      const capacitacionDate = new Date(capacitacion.fecha)
      const now = new Date()

      switch (filterFecha) {
        case "proximas":
          matchesFecha = capacitacionDate > now
          break
        case "pasadas":
          matchesFecha = capacitacionDate < now
          break
        case "este_mes":
          matchesFecha =
            capacitacionDate.getMonth() === now.getMonth() && capacitacionDate.getFullYear() === now.getFullYear()
          break
      }
    }

    return matchesSearch && matchesFecha
  })

  // Calcular estadísticas generales
  const totalParticipantes = capacitaciones.reduce((sum, c) => sum + c.capacitacion_participantes.length, 0)
  const totalAsistencias = capacitaciones.reduce(
    (sum, c) => sum + c.capacitacion_participantes.filter((p) => p.asistio).length,
    0,
  )
  const promedioAsistencia = totalParticipantes > 0 ? (totalAsistencias / totalParticipantes) * 100 : 0

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
          <h1 className="text-3xl font-bold tracking-tight">Capacitaciones</h1>
          <p className="text-muted-foreground">Gestión de capacitaciones del personal</p>
        </div>
        {user && ["supervisor", "admin"].includes(user.rol) && (
          <Link href="/capacitaciones/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Capacitación
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacitaciones</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capacitaciones.length}</div>
            <p className="text-xs text-muted-foreground">
              {capacitaciones.filter((c) => new Date(c.fecha) > new Date()).length} próximas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipantes}</div>
            <p className="text-xs text-muted-foreground">Total de inscripciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promedioAsistencia.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{totalAsistencias} asistencias</p>
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
                capacitaciones.filter((c) => {
                  const date = new Date(c.fecha)
                  const now = new Date()
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Capacitaciones programadas</p>
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
                  placeholder="Buscar por tema o responsable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterFecha} onValueChange={setFilterFecha}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="proximas">Próximas</SelectItem>
                <SelectItem value="pasadas">Pasadas</SelectItem>
                <SelectItem value="este_mes">Este mes</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || filterFecha !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterFecha("all")
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
          <CardTitle>Capacitaciones Programadas</CardTitle>
          <CardDescription>
            {filteredCapacitaciones.length} de {capacitaciones.length} capacitaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tema</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead>Asistencia</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCapacitaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No se encontraron capacitaciones.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCapacitaciones.map((capacitacion) => {
                    const asistenciaStats = getAsistenciaStats(capacitacion)
                    const calificacionPromedio = getCalificacionPromedio(capacitacion)
                    const esFutura = new Date(capacitacion.fecha) > new Date()

                    return (
                      <TableRow key={capacitacion.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{capacitacion.tema}</div>
                            {capacitacion.descripcion && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {capacitacion.descripcion}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{capacitacion.responsable?.nombre_completo || "Sin asignar"}</div>
                            {capacitacion.responsable?.departamento && (
                              <div className="text-sm text-muted-foreground">
                                {capacitacion.responsable.departamento}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {format(new Date(capacitacion.fecha), "dd/MM/yyyy", { locale: es })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(capacitacion.fecha), "HH:mm", { locale: es })}
                            </div>
                            {esFutura && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Próxima
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{asistenciaStats.total} inscritos</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {asistenciaStats.asistieron}/{asistenciaStats.total}
                              </span>
                              <Badge
                                variant={getAsistenciaBadgeVariant(asistenciaStats.porcentaje)}
                                className="text-xs"
                              >
                                {asistenciaStats.porcentaje.toFixed(0)}%
                              </Badge>
                            </div>
                            <Progress value={asistenciaStats.porcentaje} className="h-1" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {calificacionPromedio !== null ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{calificacionPromedio.toFixed(1)}</span>
                              <Badge
                                variant={getCalificacionBadgeVariant(calificacionPromedio)}
                                className="text-xs"
                              >
                                {getCalificacionLabel(calificacionPromedio)}
                              </Badge>
                            </div>
                          ) : (
                            <Badge variant="secondary">Sin calificar</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {capacitacion.material_pdf ? (
                            <Badge variant="default">Disponible</Badge>
                          ) : (
                            <Badge variant="secondary">Sin material</Badge>
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
                                <Link href={`/capacitaciones/${capacitacion.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalles
                                </Link>
                              </DropdownMenuItem>
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
