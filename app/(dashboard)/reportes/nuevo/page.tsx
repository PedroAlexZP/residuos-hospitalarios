"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, FileText, Calendar, Filter, UserIcon, Settings } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { format } from "date-fns"

const TIPOS_REPORTE = [
  { 
    value: "residuos_generados", 
    label: "Residuos Generados", 
    description: "Reporte detallado de residuos por período, tipo y departamento",
    filters: ["fecha_inicio", "fecha_fin", "tipo_residuo", "departamento"]
  },
  { 
    value: "cumplimiento_normativo", 
    label: "Cumplimiento Normativo", 
    description: "Indicadores de cumplimiento con regulaciones sanitarias",
    filters: ["fecha_inicio", "fecha_fin", "departamento"]
  },
  { 
    value: "entregas_externas", 
    label: "Entregas Externas", 
    description: "Registro de entregas a gestores externos autorizados",
    filters: ["fecha_inicio", "fecha_fin", "gestor_externo"]
  },
  { 
    value: "incidencias", 
    label: "Incidencias", 
    description: "Reporte de incidencias registradas y su seguimiento",
    filters: ["fecha_inicio", "fecha_fin", "tipo_incidencia", "urgencia", "estado"]
  },
  { 
    value: "capacitaciones", 
    label: "Capacitaciones", 
    description: "Seguimiento de capacitaciones del personal",
    filters: ["fecha_inicio", "fecha_fin", "departamento", "tipo_capacitacion"]
  },
  { 
    value: "inventario", 
    label: "Inventario", 
    description: "Estado actual del inventario de contenedores y equipos",
    filters: ["departamento", "tipo_contenedor", "estado"]
  },
]

const DEPARTAMENTOS = [
  "Administración", "Enfermería", "Cirugía", "Laboratorio", "Farmacia", 
  "Oncología", "Emergencias", "Pediatría", "Maternidad", "Consulta Externa"
]

const TIPOS_RESIDUO = [
  "anatomopatologico", "cortopunzante", "farmaceutico", "quimioterapico", 
  "radioactivo", "infeccioso", "patologico"
]

export default function NuevoReportePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [form, setForm] = useState({
    tipo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    incluir_graficos: true,
    formato: "pdf",
    // Filtros específicos
    departamentos: [] as string[],
    tipos_residuo: [] as string[],
    urgencias: [] as string[],
    estados: [] as string[],
  })

  const [errors, setErrors] = useState<{
    tipo?: string
    descripcion?: string
    fecha_inicio?: string
    fecha_fin?: string
  }>({})

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const user = await getCurrentUser()
      console.log("=== DEBUG: Usuario cargado ===")
      console.log("user:", JSON.stringify(user, null, 2))
      console.log("user.id:", user?.id)
      console.log("tipo de user.id:", typeof user?.id)
      console.log("===============================")
      setCurrentUser(user)
      
      // Establecer fechas por defecto
      const today = new Date()
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      
      setForm(prev => ({
        ...prev,
        fecha_inicio: format(firstDayOfMonth, "yyyy-MM-dd"),
        fecha_fin: format(today, "yyyy-MM-dd")
      }))
    } catch (error) {
      console.error("Error loading initial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value })
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setForm({ ...form, [name]: checked })
  }

  const handleMultiSelectChange = (fieldName: string, value: string, checked: boolean) => {
    setForm(prev => {
      const currentArray = prev[fieldName as keyof typeof prev] as string[]
      if (checked) {
        return { ...prev, [fieldName]: [...currentArray, value] }
      } else {
        return { ...prev, [fieldName]: currentArray.filter(item => item !== value) }
      }
    })
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!form.tipo) newErrors.tipo = "Selecciona un tipo de reporte."
    if (!form.descripcion || form.descripcion.length < 10) {
      newErrors.descripcion = "La descripción debe tener al menos 10 caracteres."
    }
    if (!form.fecha_inicio) newErrors.fecha_inicio = "Selecciona una fecha de inicio."
    if (!form.fecha_fin) newErrors.fecha_fin = "Selecciona una fecha de fin."
    
    if (form.fecha_inicio && form.fecha_fin) {
      if (new Date(form.fecha_inicio) > new Date(form.fecha_fin)) {
        newErrors.fecha_fin = "La fecha de fin debe ser posterior a la fecha de inicio."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !currentUser) return

    setSaving(true)
    try {
      // Preparar filtros aplicados
      const filtrosAplicados = {
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        departamentos: form.departamentos,
        tipos_residuo: form.tipos_residuo,
        urgencias: form.urgencias,
        estados: form.estados,
        incluir_graficos: form.incluir_graficos,
        formato: form.formato
      }

      // Preparar datos para insertar - versión completa
      const insertData = {
        tipo: form.tipo,
        descripcion: form.descripcion,
        filtros_aplicados: filtrosAplicados,
        usuario_id: currentUser.id,
        estado: "generando"
      }

      // Debug: mostrar exactamente qué se va a insertar
      console.log("=== DEBUG: Datos a insertar ===")
      console.log("insertData:", JSON.stringify(insertData, null, 2))
      console.log("currentUser.id:", currentUser.id)
      console.log("currentUser:", JSON.stringify(currentUser, null, 2))
      console.log("===============================")

      const { data, error } = await supabase
        .from("reportes")
        .insert(insertData)
        .select()

      if (error) {
        console.error("=== DEBUG: Error de Supabase ===")
        console.error("Error code:", error.code)
        console.error("Error message:", error.message)
        console.error("Error details:", error.details)
        console.error("Error hint:", error.hint)
        console.error("================================")
        throw error
      }

      console.log("=== DEBUG: Inserción exitosa ===")
      console.log("data:", data)
      console.log("===============================")

      alert("Reporte programado correctamente! Se generará en breve.")
      router.push("/reportes")
    } catch (error) {
      console.error("Error creating reporte:", error)
      alert(`Error al crear el reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setSaving(false)
    }
  }

  const selectedReportType = TIPOS_REPORTE.find(t => t.value === form.tipo)

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando...</div>
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
          onClick={() => router.push("/reportes")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Reporte</h1>
          <p className="text-muted-foreground">Configura y genera un nuevo reporte del sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Reporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tipo de Reporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tipo">Seleccionar Tipo</Label>
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
              {errors.tipo && <div className="text-red-500 text-sm mt-1">{errors.tipo}</div>}
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción del Reporte</Label>
              <Textarea 
                id="descripcion" 
                name="descripcion" 
                value={form.descripcion} 
                onChange={handleInputChange}
                placeholder="Describe el propósito y alcance de este reporte..."
                rows={3}
                required 
              />
              {errors.descripcion && <div className="text-red-500 text-sm mt-1">{errors.descripcion}</div>}
            </div>
          </CardContent>
        </Card>

        {/* Período de Tiempo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período de Tiempo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                <Input 
                  id="fecha_inicio" 
                  name="fecha_inicio" 
                  type="date" 
                  value={form.fecha_inicio} 
                  onChange={handleInputChange}
                  required 
                />
                {errors.fecha_inicio && <div className="text-red-500 text-sm mt-1">{errors.fecha_inicio}</div>}
              </div>
              
              <div>
                <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                <Input 
                  id="fecha_fin" 
                  name="fecha_fin" 
                  type="date" 
                  value={form.fecha_fin} 
                  onChange={handleInputChange}
                  required 
                />
                {errors.fecha_fin && <div className="text-red-500 text-sm mt-1">{errors.fecha_fin}</div>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros Específicos */}
        {selectedReportType && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Específicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtro por Departamentos */}
              {selectedReportType.filters.includes("departamento") && (
                <div>
                  <Label>Departamentos (opcional)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {DEPARTAMENTOS.map((dept) => (
                      <div key={dept} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dept-${dept}`}
                          checked={form.departamentos.includes(dept)}
                          onCheckedChange={(checked) => 
                            handleMultiSelectChange('departamentos', dept, checked as boolean)
                          }
                        />
                        <Label htmlFor={`dept-${dept}`} className="text-sm">{dept}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtro por Tipos de Residuo */}
              {selectedReportType.filters.includes("tipo_residuo") && (
                <div>
                  <Label>Tipos de Residuo (opcional)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {TIPOS_RESIDUO.map((tipo) => (
                      <div key={tipo} className="flex items-center space-x-2">
                        <Checkbox
                          id={`residuo-${tipo}`}
                          checked={form.tipos_residuo.includes(tipo)}
                          onCheckedChange={(checked) => 
                            handleMultiSelectChange('tipos_residuo', tipo, checked as boolean)
                          }
                        />
                        <Label htmlFor={`residuo-${tipo}`} className="text-sm capitalize">
                          {tipo.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtros para Incidencias */}
              {form.tipo === "incidencias" && (
                <>
                  <div>
                    <Label>Urgencias (opcional)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {["baja", "media", "alta", "critica"].map((urgencia) => (
                        <div key={urgencia} className="flex items-center space-x-2">
                          <Checkbox
                            id={`urgencia-${urgencia}`}
                            checked={form.urgencias.includes(urgencia)}
                            onCheckedChange={(checked) => 
                              handleMultiSelectChange('urgencias', urgencia, checked as boolean)
                            }
                          />
                          <Label htmlFor={`urgencia-${urgencia}`} className="text-sm capitalize">
                            {urgencia}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Estados (opcional)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {["abierta", "en_proceso", "resuelta", "cerrada"].map((estado) => (
                        <div key={estado} className="flex items-center space-x-2">
                          <Checkbox
                            id={`estado-${estado}`}
                            checked={form.estados.includes(estado)}
                            onCheckedChange={(checked) => 
                              handleMultiSelectChange('estados', estado, checked as boolean)
                            }
                          />
                          <Label htmlFor={`estado-${estado}`} className="text-sm">
                            {estado.replace('_', ' ').charAt(0).toUpperCase() + estado.replace('_', ' ').slice(1)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Configuración de Salida */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Salida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Formato de Archivo</Label>
              <Select value={form.formato} onValueChange={(value) => handleSelectChange('formato', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="incluir_graficos"
                checked={form.incluir_graficos}
                onCheckedChange={(checked) => handleCheckboxChange('incluir_graficos', checked as boolean)}
              />
              <Label htmlFor="incluir_graficos">Incluir gráficos y visualizaciones</Label>
            </div>
          </CardContent>
        </Card>

        {/* Usuario Actual */}
        {currentUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Información del Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Nombre:</strong> {currentUser.nombre_completo}
                </div>
                <div>
                  <strong>Email:</strong> {currentUser.email}
                </div>
                <div>
                  <strong>Departamento:</strong> {currentUser.departamento || 'No especificado'}
                </div>
                <div>
                  <strong>Rol:</strong> {currentUser.rol}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Generando Reporte..." : "Generar Reporte"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push("/reportes")} 
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
