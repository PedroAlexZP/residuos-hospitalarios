"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2, AlertTriangle, Clock, FileText, User as UserIcon } from "lucide-react"
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
  usuario: {
    nombre_completo: string
    departamento: string
  }
}

const URGENCY_COLORS = {
  baja: "bg-green-100 text-green-800",
  media: "bg-yellow-100 text-yellow-800",
  alta: "bg-orange-100 text-orange-800",
  critica: "bg-red-100 text-red-800"
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

export default function EliminarIncidenciaPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [incidencia, setIncidencia] = useState<Incidencia | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
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

      // Cargar incidencia con usuario
      const { data: incidenciaData, error: incidenciaError } = await supabase
        .from("incidencias")
        .select(`
          *,
          usuario:users(nombre_completo, departamento)
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

      // Verificar permisos
      if (user && !canDelete(user, incidenciaData)) {
        setError("No tienes permisos para eliminar esta incidencia")
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

  const canDelete = (user: User, incidencia: Incidencia) => {
    return (
      user.rol === "admin" ||
      user.id === incidencia.usuario_id
    )
  }

  const handleDelete = async () => {
    if (!incidencia || !confirm("¿Estás seguro de que deseas eliminar esta incidencia? Esta acción no se puede deshacer.")) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from("incidencias")
        .delete()
        .eq("id", id)

      if (error) throw error

      alert("Incidencia eliminada correctamente!")
      router.push("/incidencias")
    } catch (error) {
      console.error("Error deleting incidencia:", error)
      alert("Error al eliminar la incidencia")
    } finally {
      setDeleting(false)
    }
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
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/incidencias/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-red-600">Eliminar Incidencia</h1>
          <p className="text-muted-foreground">ID: {incidencia.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* Warning */}
      <Card className="border-red-200 bg-red-50 mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">¡Advertencia!</h3>
              <p className="text-red-700">
                Estás a punto de eliminar esta incidencia permanentemente. Esta acción no se puede deshacer.
                Todos los datos asociados se perderán para siempre.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidencia Preview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información de la Incidencia a Eliminar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo</label>
              <p className="mt-1">{TIPOS_INCIDENCIA[incidencia.tipo as keyof typeof TIPOS_INCIDENCIA] || incidencia.tipo}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha</label>
              <p className="mt-1">{format(new Date(incidencia.fecha), "PPP", { locale: es })}</p>
            </div>
            
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
              <p className="mt-1">{incidencia.estado.replace('_', ' ').charAt(0).toUpperCase() + incidencia.estado.replace('_', ' ').slice(1)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Usuario Responsable</label>
            <div className="flex items-center gap-2 mt-1">
              <UserIcon className="h-4 w-4" />
              <span>{incidencia.usuario.nombre_completo}</span>
              <span className="text-muted-foreground">({incidencia.usuario.departamento})</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Descripción</label>
            <div className="mt-2 p-3 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap text-sm">
                {incidencia.descripcion.length > 200 
                  ? `${incidencia.descripcion.substring(0, 200)}...` 
                  : incidencia.descripcion
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <p className="text-lg font-medium">¿Estás seguro de que deseas eliminar esta incidencia?</p>
            <p className="text-muted-foreground">
              Esta acción es irreversible y eliminará toda la información asociada.
            </p>
            
            <div className="flex gap-4 justify-center mt-6">
              <Button
                variant="destructive"
                size="lg"
                onClick={handleDelete}
                disabled={deleting}
                className="min-w-[140px]"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Eliminando..." : "Sí, Eliminar"}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push(`/incidencias/${id}`)}
                disabled={deleting}
                className="min-w-[140px]"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 