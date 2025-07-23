"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2, AlertTriangle, FileText, Calendar, UserIcon, Settings } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"

interface Reporte {
  id: string
  tipo: string
  descripcion: string
  fecha_generacion: string
  estado: string
  usuario_id: string
  filtros_aplicados?: any
}

const TIPOS_REPORTE = [
  { value: "residuos_generados", label: "Residuos Generados" },
  { value: "cumplimiento_normativo", label: "Cumplimiento Normativo" },
  { value: "entregas_externas", label: "Entregas Externas" },
  { value: "incidencias", label: "Incidencias" },
  { value: "capacitaciones", label: "Capacitaciones" },
  { value: "inventario", label: "Inventario" },
]

const ESTADOS = [
  { value: "pendiente", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "generando", label: "Generando", color: "bg-blue-100 text-blue-800" },
  { value: "completado", label: "Completado", color: "bg-green-100 text-green-800" },
  { value: "error", label: "Error", color: "bg-red-100 text-red-800" }
]

export default function EliminarReportePage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmStep, setConfirmStep] = useState(0) // 0: preview, 1: confirm, 2: final confirm

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar usuario actual
      const user = await getCurrentUser()
      setCurrentUser(user)

      // Cargar reporte
      const { data: reporteData, error: reporteError } = await supabase
        .from("reportes")
        .select("*")
        .eq("id", id)
        .single()

      if (reporteError) {
        throw reporteError
      }

      if (!reporteData) {
        setError("Reporte no encontrado")
        return
      }

      // Verificar permisos
      if (user && !canDelete(user, reporteData)) {
        setError("No tienes permisos para eliminar este reporte")
        return
      }

      setReporte(reporteData)
    } catch (error) {
      console.error("Error loading reporte:", error)
      setError("Error al cargar el reporte")
    } finally {
      setLoading(false)
    }
  }

  const canDelete = (user: User, reporte: Reporte) => {
    return (
      user.rol === "admin" ||
      (user.rol === "supervisor" && user.id === reporte.usuario_id)
    )
  }

  const getTipoLabel = (tipo: string) => {
    return TIPOS_REPORTE.find(t => t.value === tipo)?.label || tipo
  }

  const getEstadoBadge = (estado: string) => {
    const estadoConfig = ESTADOS.find(e => e.value === estado)
    return estadoConfig || { label: estado, color: "bg-gray-100 text-gray-800" }
  }

  const handleDelete = async () => {
    if (!reporte) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from("reportes")
        .delete()
        .eq("id", id)

      if (error) throw error

      alert("Reporte eliminado correctamente!")
      router.push("/reportes")
    } catch (error) {
      console.error("Error deleting reporte:", error)
      alert("Error al eliminar el reporte")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando reporte...</div>
      </div>
    )
  }

  if (error || !reporte) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-muted-foreground mb-4">{error || "Reporte no encontrado"}</p>
              <Button onClick={() => router.push("/reportes")}>
                Volver a Reportes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const estadoBadge = getEstadoBadge(reporte.estado)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/reportes/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-red-600">Eliminar Reporte</h1>
          <p className="text-muted-foreground">ID: {reporte.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* Warning */}
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">⚠️ Acción Irreversible</h3>
              <p className="text-red-700 mb-2">
                Estás a punto de eliminar permanentemente este reporte. Esta acción no se puede deshacer.
              </p>
              <ul className="text-sm text-red-600 space-y-1">
                <li>• Se perderán todos los datos del reporte</li>
                <li>• Se eliminarán los filtros aplicados y configuración</li>
                <li>• Los archivos generados también podrían verse afectados</li>
                <li>• No hay forma de recuperar la información después</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview del Reporte */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información del Reporte a Eliminar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Tipo de Reporte</p>
                  <p className="text-muted-foreground">{getTipoLabel(reporte.tipo)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Fecha de Generación</p>
                  <p className="text-muted-foreground">
                    {new Date(reporte.fecha_generacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Creado por</p>
                  <p className="text-muted-foreground">{currentUser?.nombre_completo}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Estado</p>
                  <Badge className={estadoBadge.color}>{estadoBadge.label}</Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Filtros Aplicados</p>
                  <p className="text-muted-foreground">
                    {reporte.filtros_aplicados ? "Configurados" : "Sin filtros específicos"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="font-medium mb-2">Descripción</p>
            <p className="text-muted-foreground">{reporte.descripcion}</p>
          </div>
        </CardContent>
      </Card>

      {/* Proceso de Confirmación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Confirmación de Eliminación</CardTitle>
        </CardHeader>
        <CardContent>
          {confirmStep === 0 && (
            <div className="space-y-4">
              <p>Revisa cuidadosamente la información del reporte arriba.</p>
              <p className="text-sm text-muted-foreground">
                Una vez que confirmes, no podrás recuperar este reporte ni sus datos asociados.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/reportes/${id}`)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmStep(1)}
                  className="flex-1"
                >
                  Continuar con la Eliminación
                </Button>
              </div>
            </div>
          )}

          {confirmStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-800 mb-2">Confirmación Requerida</p>
                <p className="text-red-700 text-sm">
                  ¿Estás completamente seguro de que quieres eliminar este reporte? 
                  Esta acción eliminará permanentemente todos los datos.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setConfirmStep(0)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmStep(2)}
                  className="flex-1"
                >
                  Sí, Eliminar Reporte
                </Button>
              </div>
            </div>
          )}

          {confirmStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="font-bold text-red-900 mb-2">⚠️ ÚLTIMA CONFIRMACIÓN</p>
                <p className="text-red-800 text-sm mb-3">
                  Esta es tu última oportunidad para cancelar. Una vez que hagas clic en 
                  "ELIMINAR DEFINITIVAMENTE", el reporte se eliminará permanentemente.
                </p>
                <p className="text-red-800 font-medium text-sm">
                  Reporte: {getTipoLabel(reporte.tipo)} - {reporte.id.slice(0, 8)}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setConfirmStep(1)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "ELIMINANDO..." : "ELIMINAR DEFINITIVAMENTE"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
