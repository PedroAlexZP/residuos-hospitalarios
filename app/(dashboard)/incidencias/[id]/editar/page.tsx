"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Save, AlertTriangle, Clock, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"

const URGENCIAS = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" }
]

const ESTADOS = [
  { value: "abierta", label: "Abierta" },
  { value: "en_proceso", label: "En Proceso" },
  { value: "resuelta", label: "Resuelta" },
  { value: "cerrada", label: "Cerrada" }
]

const TIPOS_INCIDENCIA = [
  { value: "contaminacion_cruzada", label: "Contaminación Cruzada" },
  { value: "derrame", label: "Derrame de Residuos" },
  { value: "contenedor_danado", label: "Contenedor Dañado" },
  { value: "recoleccion_tardía", label: "Recolección Tardía" },
  { value: "clasificacion_incorrecta", label: "Clasificación Incorrecta" },
  { value: "falta_etiquetado", label: "Falta de Etiquetado" },
  { value: "exceso_capacidad", label: "Exceso de Capacidad" },
  { value: "fuga_liquidos", label: "Fuga de Líquidos" },
  { value: "mal_almacenamiento", label: "Mal Almacenamiento" },
  { value: "otro", label: "Otro" }
]

interface Incidencia {
  id: string
  tipo: string
  descripcion: string
  urgencia: string
  estado: string
  usuario_id: string
  residuo_id?: string
}

export default function EditarIncidenciaPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [incidencia, setIncidencia] = useState<Incidencia | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    tipo: "",
    descripcion: "",
    urgencia: "",
    estado: "",
  })

  const [errors, setErrors] = useState<{
    tipo?: string
    descripcion?: string
    urgencia?: string
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

      // Cargar incidencia
      const { data: incidenciaData, error: incidenciaError } = await supabase
        .from("incidencias")
        .select("*")
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
      if (user && !canEdit(user, incidenciaData)) {
        setError("No tienes permisos para editar esta incidencia")
        return
      }

      setIncidencia(incidenciaData)
      setForm({
        tipo: incidenciaData.tipo,
        descripcion: incidenciaData.descripcion,
        urgencia: incidenciaData.urgencia,
        estado: incidenciaData.estado,
      })
    } catch (error) {
      console.error("Error loading incidencia:", error)
      setError("Error al cargar la incidencia")
    } finally {
      setLoading(false)
    }
  }

  const canEdit = (user: User, incidencia: Incidencia) => {
    return (
      user.rol === "admin" ||
      user.rol === "supervisor" ||
      user.id === incidencia.usuario_id
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

    if (!form.tipo) newErrors.tipo = "Selecciona un tipo de incidencia."
    if (!form.descripcion || form.descripcion.length < 10) {
      newErrors.descripcion = "La descripción debe tener al menos 10 caracteres."
    }
    if (!form.urgencia) newErrors.urgencia = "Selecciona una urgencia."
    if (!form.estado) newErrors.estado = "Selecciona un estado."

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !incidencia) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("incidencias")
        .update({
          tipo: form.tipo,
          descripcion: form.descripcion,
          urgencia: form.urgencia,
          estado: form.estado,
        })
        .eq("id", id)

      if (error) throw error

      alert("Incidencia actualizada correctamente!")
      router.push(`/incidencias/${id}`)
    } catch (error) {
      console.error("Error updating incidencia:", error)
      alert("Error al actualizar la incidencia")
    } finally {
      setSaving(false)
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
          <h1 className="text-2xl font-bold">Editar Incidencia</h1>
          <p className="text-muted-foreground">ID: {incidencia.id.slice(0, 8)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Información de la Incidencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Incidencia */}
            <div className="space-y-2">
              <Label htmlFor="tipo" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tipo de Incidencia
              </Label>
              <Select value={form.tipo} onValueChange={(value) => handleSelectChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de incidencia" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_INCIDENCIA.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && <div className="text-red-500 text-sm">{errors.tipo}</div>}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción Detallada</Label>
              <Textarea 
                id="descripcion" 
                name="descripcion" 
                value={form.descripcion} 
                onChange={handleTextareaChange}
                placeholder="Describe detalladamente la incidencia..."
                rows={4}
                required 
              />
              {errors.descripcion && <div className="text-red-500 text-sm">{errors.descripcion}</div>}
            </div>

            {/* Urgencia */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Nivel de Urgencia
              </Label>
              <Select value={form.urgencia} onValueChange={(value) => handleSelectChange('urgencia', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la urgencia" />
                </SelectTrigger>
                <SelectContent>
                  {URGENCIAS.map((urgencia) => (
                    <SelectItem key={urgencia.value} value={urgencia.value}>
                      {urgencia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.urgencia && <div className="text-red-500 text-sm">{errors.urgencia}</div>}
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label>Estado</Label>
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

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/incidencias/${id}`)} 
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