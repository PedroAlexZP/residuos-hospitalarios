"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash2, AlertTriangle, Clock, User as UserIcon, Package, FileText, Calendar, MapPin } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Incidencia {
  id: string
  tipo: string
  descripcion: string
  urgencia: string
  estado: string
  fecha: string
  usuario_id: string
  residuo_id?: string
  evidencias?: unknown
  usuario: {
    id: string
    nombre_completo: string
    email: string
    departamento: string
    rol: string
  }
  residuo?: {
    id: string
    tipo: string
    cantidad: number
    ubicacion: string
    fecha_generacion: string
    estado: string
  }
}

const URGENCY_COLORS = {
  baja: "bg-green-100 text-green-800",
  media: "bg-yellow-100 text-yellow-800",
  alta: "bg-orange-100 text-orange-800",
  critica: "bg-red-100 text-red-800"
}

const ESTADO_COLORS = {
  abierta: "bg-red-100 text-red-800",
  en_proceso: "bg-blue-100 text-blue-800",
  resuelta: "bg-green-100 text-green-800",
  cerrada: "bg-gray-100 text-gray-800"
}

const TIPOS_INCIDENCIA = {
  contaminacion_cruzada: "Contaminación Cruzada",
  derrame: "Derrame de Residuos",
  contenedor_danado: "Contenedor Dañado",
  recoleccion_tardía: "Recolección Tardía",
  clasificacion_incorrecta: "Clasificación Incorrecta",
  falta_etiquetado: "Falta de Etiquetado",
  exceso_capacidad: "Exceso de Capacidad",
  fuga_liquidos: "Fuga de Líquidos",
  mal_almacenamiento: "Mal Almacenamiento",
  otro: "Otro"
}

export default function IncidenciaDetallePage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [incidencia, setIncidencia] = useState<Incidencia | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar usuario actual
      const user = await getCurrentUser()
      setCurrentUser(user)

      // Cargar incidencia con relaciones
      const { data: incidenciaData, error: incidenciaError } = await supabase
        .from("incidencias")
        .select(`
          *,
          usuario:users(id, nombre_completo, email, departamento, rol),
          residuo:residuos(id, tipo, cantidad, ubicacion, fecha_generacion, estado)
        `)
        .eq("id", id)
        .single()

      if (incidenciaError) {
        throw incidenciaError
      }

      if (!incidenciaData) {
        setError("Incidencia no encontrada")
        return
      }

      setIncidencia(incidenciaData)
    } catch (error) {
      console.error("Error loading incidencia:", error)
      setError("Error al cargar la incidencia")
    } finally {
      setLoading(false)
    }
  }

  const canEdit = () => {
    if (!currentUser || !incidencia) return false
    return (
      currentUser.rol === "admin" ||
      currentUser.rol === "supervisor" ||
      currentUser.id === incidencia.usuario_id
    )
  }

  const canDelete = () => {
    if (!currentUser || !incidencia) return false
    return (
      currentUser.rol === "admin" ||
      currentUser.id === incidencia.usuario_id
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando incidencia...</div>
      </div>
    )
  }

  if (error || !incidencia) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-muted-foreground mb-4">{error || "Incidencia no encontrada"}</p>
              <Button onClick={() => router.push("/incidencias")}>
                Volver a Incidencias
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/incidencias")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalle de Incidencia</h1>
            <p className="text-muted-foreground">ID: {incidencia.id.slice(0, 8)}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          {canEdit() && (
            <Button asChild variant="outline">
              <Link href={`/incidencias/${id}/editar`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          )}
          {canDelete() && (
            <Button asChild variant="destructive">
              <Link href={`/incidencias/${id}/eliminar`}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Información Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo de Incidencia</label>
                <div className="flex items-center gap-2 mt-1">
                  <FileText className="h-4 w-4" />
                  <span>{TIPOS_INCIDENCIA[incidencia.tipo as keyof typeof TIPOS_INCIDENCIA] || incidencia.tipo}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha de Reporte</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(incidencia.fecha), "PPP 'a las' p", { locale: es })}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Urgencia</label>
                <div className="mt-1">
                  <Badge className={URGENCY_COLORS[incidencia.urgencia as keyof typeof URGENCY_COLORS]}>
                    <Clock className="h-3 w-3 mr-1" />
                    {incidencia.urgencia.charAt(0).toUpperCase() + incidencia.urgencia.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <div className="mt-1">
                  <Badge className={ESTADO_COLORS[incidencia.estado as keyof typeof ESTADO_COLORS]}>
                    {incidencia.estado.replace('_', ' ').charAt(0).toUpperCase() + incidencia.estado.replace('_', ' ').slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">Descripción</label>
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{incidencia.descripcion}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usuario Responsable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Usuario Responsable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
                <p className="mt-1">{incidencia.usuario.nombre_completo}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="mt-1">{incidencia.usuario.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Departamento</label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{incidencia.usuario.departamento}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rol</label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {incidencia.usuario.rol.charAt(0).toUpperCase() + incidencia.usuario.rol.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Residuo Relacionado */}
        {incidencia.residuo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Residuo Relacionado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código</label>
                  <p className="mt-1 font-mono">
                    {incidencia.residuo.tipo.substring(0, 3).toUpperCase()}-{incidencia.residuo.id.substring(0, 8)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <p className="mt-1">{incidencia.residuo.tipo}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cantidad</label>
                  <p className="mt-1">{incidencia.residuo.cantidad} kg</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{incidencia.residuo.ubicacion}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Generación</label>
                  <p className="mt-1">{format(new Date(incidencia.residuo.fecha_generacion), "PPP", { locale: es })}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado del Residuo</label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {incidencia.residuo.estado.charAt(0).toUpperCase() + incidencia.residuo.estado.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 