"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  FileText, 
  Users, 
  Edit, 
  Trash2,
  Download,
  MapPin,
  Clock,
  Award,
  CheckCircle,
  XCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Capacitacion {
  id: string
  tema: string
  descripcion: string
  fecha: string
  material_pdf: string | null
  created_at: string
  responsable: {
    id: string
    nombre_completo: string
    departamento: string | null
    rol: string
  } | null
  capacitacion_participantes: {
    id: string
    asistio: boolean
    calificacion: number | null
    usuario: {
      id: string
      nombre_completo: string
      departamento: string | null
      rol: string
    }
  }[]
}

export default function DetalleCapacitacionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params
  const [user, setUser] = useState<User | null>(null)
  const [capacitacion, setCapacitacion] = useState<Capacitacion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        await fetchCapacitacion()
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const fetchCapacitacion = async () => {
    try {
      const { data, error } = await supabase
        .from("capacitaciones")
        .select(`
          *,
          responsable:users!capacitaciones_responsable_id_fkey(
            id, nombre_completo, departamento, rol
          ),
          capacitacion_participantes(
            id, asistio, calificacion,
            usuario:users(id, nombre_completo, departamento, rol)
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      setCapacitacion(data)
    } catch (error) {
      console.error("Error fetching capacitacion:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la capacitación",
        variant: "destructive",
      })
    }
  }

  const getEstadoCapacitacion = (fecha: string) => {
    const fechaCapacitacion = new Date(fecha)
    const ahora = new Date()
    
    if (fechaCapacitacion > ahora) {
      return { label: "Programada", variant: "secondary" as const, icon: Clock }
    } else {
      return { label: "Completada", variant: "default" as const, icon: CheckCircle }
    }
  }

  const getAsistenciaStats = () => {
    if (!capacitacion?.capacitacion_participantes?.length) return { total: 0, asistieron: 0, porcentaje: 0 }
    
    const total = capacitacion.capacitacion_participantes.length
    const asistieron = capacitacion.capacitacion_participantes.filter(p => p.asistio).length
    const porcentaje = total > 0 ? Math.round((asistieron / total) * 100) : 0
    
    return { total, asistieron, porcentaje }
  }

  const getCalificacionPromedio = () => {
    const participantesConCalificacion = capacitacion?.capacitacion_participantes?.filter(
      p => p.calificacion !== null
    ) || []
    
    if (participantesConCalificacion.length === 0) return null
    
    const suma = participantesConCalificacion.reduce((acc, p) => acc + (p.calificacion || 0), 0)
    return Math.round(suma / participantesConCalificacion.length)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-8 bg-muted animate-pulse rounded w-64" />
            <div className="h-4 bg-muted animate-pulse rounded w-80" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (!capacitacion) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <XCircle className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Capacitación no encontrada</h2>
          <p className="text-muted-foreground">La capacitación que busca no existe o ha sido eliminada</p>
        </div>
        <Button onClick={() => router.push("/capacitaciones")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Capacitaciones
        </Button>
      </div>
    )
  }

  const estado = getEstadoCapacitacion(capacitacion.fecha)
  const asistenciaStats = getAsistenciaStats()
  const calificacionPromedio = getCalificacionPromedio()
  const IconoEstado = estado.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{capacitacion.tema}</h1>
            <Badge variant={estado.variant} className="ml-2">
              <IconoEstado className="h-3 w-3 mr-1" />
              {estado.label}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {format(new Date(capacitacion.fecha), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
          </p>
        </div>
        {user && ["supervisor", "admin"].includes(user.rol) && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/capacitaciones/${id}/editar`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => router.push(`/capacitaciones/${id}/eliminar`)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
              <p className="mt-1 text-sm">{capacitacion.descripcion}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Fecha y Hora</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(capacitacion.fecha), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Creada</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(capacitacion.created_at), "dd/MM/yyyy")}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Responsable</Label>
              {capacitacion.responsable ? (
                <div className="flex items-center gap-3 mt-2">
                  <Avatar>
                    <AvatarFallback>
                      {capacitacion.responsable.nombre_completo.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{capacitacion.responsable.nombre_completo}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{capacitacion.responsable.departamento}</span>
                      <span>•</span>
                      <span className="capitalize">{capacitacion.responsable.rol}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm mt-1">Responsable no disponible</p>
              )}
            </div>

            {capacitacion.material_pdf && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Material de Apoyo</Label>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Material PDF
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{asistenciaStats.porcentaje}%</div>
                <p className="text-xs text-muted-foreground">
                  {asistenciaStats.asistieron} de {asistenciaStats.total} participantes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calificación</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calificacionPromedio !== null ? `${calificacionPromedio}/100` : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">Promedio general</p>
              </CardContent>
            </Card>
          </div>

          {/* Participantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participantes
              </CardTitle>
              <CardDescription>
                Lista de participantes registrados para esta capacitación
              </CardDescription>
            </CardHeader>
            <CardContent>
              {capacitacion.capacitacion_participantes?.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participante</TableHead>
                        <TableHead>Asistencia</TableHead>
                        <TableHead>Calificación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {capacitacion.capacitacion_participantes.map((participante) => (
                        <TableRow key={participante.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {participante.usuario.nombre_completo.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{participante.usuario.nombre_completo}</p>
                                <p className="text-xs text-muted-foreground">{participante.usuario.departamento}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={participante.asistio ? "default" : "secondary"}>
                              {participante.asistio ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Asistió
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  No asistió
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {participante.calificacion !== null ? (
                              <Badge variant={participante.calificacion >= 70 ? "default" : "destructive"}>
                                {participante.calificacion}/100
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">Sin calificar</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay participantes registrados para esta capacitación</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
