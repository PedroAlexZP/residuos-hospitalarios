"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Save, AlertTriangle, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"

const TIPOS_REPORTE = [
  { 
    value: "residuos_generados", 
    label: "Residuos Generados", 
    description: "Reporte detallado de residuos por período, tipo y departamento"
  },
  { 
    value: "cumplimiento_normativo", 
    label: "Cumplimiento Normativo", 
    description: "Indicadores de cumplimiento con regulaciones sanitarias"
  },
  { 
    value: "entregas_externas", 
    label: "Entregas Externas", 
    description: "Registro de entregas a gestores externos autorizados"
  },
  { 
    value: "incidencias", 
    label: "Incidencias", 
    description: "Reporte de incidencias registradas y su seguimiento"
  },
  { 
    value: "capacitaciones", 
    label: "Capacitaciones", 
    description: "Seguimiento de capacitaciones del personal"
  },
  { 
    value: "inventario", 
    label: "Inventario", 
    description: "Estado actual del inventario de contenedores y equipos"
  },
]

const ESTADOS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "generando", label: "Generando" },
  { value: "completado", label: "Completado" },
  { value: "error", label: "Error" }
]

interface Reporte {
  id: string
  tipo: string
  descripcion: string
  fecha_generacion: string
  estado: string
  usuario_id: string
  filtros_aplicados?: any
}

export default function EditarReportePage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    tipo: "",
    descripcion: "",
    estado: "",
  })

  const [errors, setErrors] = useState<{
    tipo?: string
    descripcion?: string
    estado?: string
  }>({})

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
      if (user && !canEdit(user, reporteData)) {
        setError("No tienes permisos para editar este reporte")
        return
      }

      setReporte(reporteData)
      setForm({
        tipo: reporteData.tipo,
        descripcion: reporteData.descripcion,
        estado: reporteData.estado,
      })
    } catch (error) {
      console.error("Error loading reporte:", error)
      setError("Error al cargar el reporte")
    } finally {
      setLoading(false)
    }
  }

  const canEdit = (user: User, reporte: Reporte) => {
    return (
      user.rol === "admin" ||
      user.rol === "supervisor" ||
      user.id === reporte.usuario_id
    )
  }

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value })
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!form.tipo) newErrors.tipo = "Selecciona un tipo de reporte."
    if (!form.descripcion || form.descripcion.length < 10) {
      newErrors.descripcion = "La descripción debe tener al menos 10 caracteres."
    }
    if (!form.estado) newErrors.estado = "Selecciona un estado."

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !reporte) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("reportes")
        .update({
          tipo: form.tipo,
          descripcion: form.descripcion,
          estado: form.estado,
        })
        .eq("id", id)

      if (error) throw error

      alert("Reporte actualizado correctamente!")
      router.push(`/reportes/${id}`)
    } catch (error) {
      console.error("Error updating reporte:", error)
      alert("Error al actualizar el reporte")
    } finally {
      setSaving(false)
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
          <h1 className="text-2xl font-bold">Editar Reporte</h1>
          <p className="text-muted-foreground">ID: {reporte.id.slice(0, 8)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Información del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Reporte */}
            <div className="space-y-2">
              <Label htmlFor="tipo" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tipo de Reporte
              </Label>
              <Select value={form.tipo} onValueChange={(value) => handleSelectChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_REPORTE.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{tipo.label}</span>
                        <span className="text-sm text-muted-foreground">{tipo.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && <div className="text-red-500 text-sm">{errors.tipo}</div>}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción del Reporte</Label>
              <Textarea 
                id="descripcion" 
                name="descripcion" 
                value={form.descripcion} 
                onChange={handleTextareaChange}
                placeholder="Describe el propósito y alcance de este reporte..."
                rows={4}
                required 
              />
              {errors.descripcion && <div className="text-red-500 text-sm">{errors.descripcion}</div>}
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label>Estado del Reporte</Label>
              <Select value={form.estado} onValueChange={(value) => handleSelectChange('estado', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.estado && <div className="text-red-500 text-sm">{errors.estado}</div>}
            </div>

            {/* Información de Solo Lectura */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>ID del Reporte:</strong> {reporte.id.slice(0, 8)}...
                </div>
                <div>
                  <strong>Fecha de Creación:</strong> {new Date(reporte.fecha_generacion).toLocaleDateString()}
                </div>
                <div>
                  <strong>Usuario:</strong> {currentUser?.nombre_completo}
                </div>
                <div>
                  <strong>Filtros Aplicados:</strong> {reporte.filtros_aplicados ? "Configurados" : "Sin filtros"}
                </div>
              </div>
            </div>

            {/* Nota sobre Limitaciones */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Nota Importante</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Los filtros aplicados y la configuración de salida no pueden modificarse después de la creación. 
                    Solo se pueden editar el tipo de reporte, la descripción y el estado.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/reportes/${id}`)} 
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
