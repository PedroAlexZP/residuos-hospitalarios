"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  BookOpen, 
  FileText,
  Eye,
  Edit,
  Download,
  GraduationCap,
  Award
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Capacitacion {
  id: string
  tema: string
  fecha: string
  descripcion: string
  material_pdf: string | null
  responsable_id: string
  created_at: string
  responsable?: {
    nombre_completo: string
    departamento: string | null
  } | null
  asistencias?: {
    id: string
    usuario_id: string
    asistio: boolean
    calificacion: number | null
    usuario: {
      nombre_completo: string
      departamento: string | null
    }
  }[]
}

export default function CapacitacionesPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const { toast } = useToast()
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMes, setFilterMes] = useState("todos")

  useEffect(() => {
    if (!userLoading && user) {
      loadCapacitaciones()
    }
  }, [userLoading, user])

  const loadCapacitaciones = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_capacitaciones_with_responsables')

      if (!rpcError && rpcData) {
        const transformedData = rpcData.map((cap: any) => ({
          id: cap.id,
          tema: cap.tema,
          fecha: cap.fecha,
          descripcion: cap.descripcion,
          material_pdf: cap.material_pdf,
          responsable_id: cap.responsable_id,
          created_at: cap.created_at,
          responsable: cap.responsable_nombre ? {
            nombre_completo: cap.responsable_nombre,
            departamento: cap.responsable_departamento
          } : null,
          asistencias: []
        }))
        setCapacitaciones(transformedData)
        return
      }

      // Fallback to direct query
      const { data, error } = await supabase
        .from("capacitaciones")
        .select(`
          *,
          responsable:users!capacitaciones_responsable_id_fkey(nombre_completo, departamento),
          asistencias(
            id,
            usuario_id,
            asistio,
            calificacion,
            usuario:users!asistencias_usuario_id_fkey(nombre_completo, departamento)
          )
        `)
        .order("fecha", { ascending: false })

      if (error) throw error
      setCapacitaciones(data || [])
      
    } catch (error) {
      console.error("Error loading capacitaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las capacitaciones",
        variant: "destructive",
      })
      setCapacitaciones([])
    } finally {
      setLoading(false)
    }
  }

  // Optimized filtering
  const filteredCapacitaciones = useMemo(() => {
    return capacitaciones.filter((capacitacion) => {
      const matchesSearch = capacitacion.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           capacitacion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (capacitacion.responsable?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      
      const fechaCapacitacion = new Date(capacitacion.fecha)
      const mesCapacitacion = fechaCapacitacion.getMonth()
      const matchesMes = filterMes === "todos" || parseInt(filterMes) === mesCapacitacion

      return matchesSearch && matchesMes
    })
  }, [capacitaciones, searchTerm, filterMes])

  // Optimized stats
  const stats = useMemo(() => {
    const total = capacitaciones.length
    const totalAsistencias = capacitaciones.reduce((acc, cap) => acc + (cap.asistencias?.length || 0), 0)
    const totalAsistieron = capacitaciones.reduce((acc, cap) => 
      acc + (cap.asistencias?.filter(a => a.asistio).length || 0), 0)
    const promedioAsistencia = totalAsistencias > 0 ? (totalAsistieron / totalAsistencias) * 100 : 0
    
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    const esteMes = capacitaciones.filter(cap => {
      const fecha = new Date(cap.fecha)
      return fecha.getMonth() === thisMonth && fecha.getFullYear() === thisYear
    }).length

    return { total, esteMes, totalAsistencias, promedioAsistencia }
  }, [capacitaciones])

  const getAsistenciaBadgeVariant = (asistencias: any[]) => {
    if (!asistencias || asistencias.length === 0) return "outline"
    const asistieron = asistencias.filter(a => a.asistio).length
    const porcentaje = (asistieron / asistencias.length) * 100
    if (porcentaje >= 80) return "default"
    if (porcentaje >= 60) return "secondary"
    return "destructive"
  }

  if (userLoading || loading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={`skeleton-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Capacitaciones</h1>
          <p className="text-gray-600">Gestiona las capacitaciones del personal</p>
        </div>
        <Link href="/capacitaciones/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Capacitación
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Capacitaciones</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-xs text-gray-500">Capacitaciones registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.esteMes}</div>
            <p className="text-xs text-gray-500">Capacitaciones programadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Participantes</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalAsistencias}</div>
            <p className="text-xs text-gray-500">Registros de asistencia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Asistencia Promedio</CardTitle>
            <Award className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.promedioAsistencia.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">Promedio de asistencia</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar y Filtrar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por tema, descripción o responsable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="lg:w-48">
              <Select value={filterMes} onValueChange={setFilterMes}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los meses</SelectItem>
                  <SelectItem value="0">Enero</SelectItem>
                  <SelectItem value="1">Febrero</SelectItem>
                  <SelectItem value="2">Marzo</SelectItem>
                  <SelectItem value="3">Abril</SelectItem>
                  <SelectItem value="4">Mayo</SelectItem>
                  <SelectItem value="5">Junio</SelectItem>
                  <SelectItem value="6">Julio</SelectItem>
                  <SelectItem value="7">Agosto</SelectItem>
                  <SelectItem value="8">Septiembre</SelectItem>
                  <SelectItem value="9">Octubre</SelectItem>
                  <SelectItem value="10">Noviembre</SelectItem>
                  <SelectItem value="11">Diciembre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Capacitaciones</CardTitle>
          <CardDescription>
            Mostrando {filteredCapacitaciones.length} de {capacitaciones.length} capacitaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tema</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Asistencia</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCapacitaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <GraduationCap className="h-8 w-8" />
                        <p>No se encontraron capacitaciones</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCapacitaciones.map((capacitacion) => (
                    <TableRow key={capacitacion.id}>
                      <TableCell>
                        <div className="font-medium">{capacitacion.tema}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {capacitacion.descripcion}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {format(new Date(capacitacion.fecha), "dd/MM/yyyy", { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {capacitacion.responsable?.nombre_completo || "Sin asignar"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {capacitacion.responsable?.departamento || "Sin departamento"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getAsistenciaBadgeVariant(capacitacion.asistencias || [])}>
                          <Users className="mr-1 h-3 w-3" />
                          {capacitacion.asistencias?.filter(a => a.asistio).length || 0}/
                          {capacitacion.asistencias?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {capacitacion.material_pdf ? (
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin material</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/capacitaciones/${capacitacion.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/capacitaciones/${capacitacion.id}/editar`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {capacitacion.material_pdf && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
