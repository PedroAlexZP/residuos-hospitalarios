"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { AlertTriangle, Package, User, FileText, Clock } from "lucide-react"

const URGENCIAS = [
  { value: "baja", label: "Baja", color: "text-green-600" },
  { value: "media", label: "Media", color: "text-yellow-600" },
  { value: "alta", label: "Alta", color: "text-orange-600" },
  { value: "critica", label: "Crítica", color: "text-red-600" }
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

interface Residuo {
  id: string
  codigo: string
  tipo: string
  descripcion: string
  peso: number
  departamento: string
}

interface Usuario {
  id: string
  nombre_completo: string
  email: string
  departamento: string
  rol: string
}

export default function NuevaIncidenciaPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [residuos, setResiduos] = useState<Residuo[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  const [form, setForm] = useState({
    tipo: "",
    descripcion: "",
    urgencia: "media",
    residuo_id: "none",
    usuario_id: "",
    estado: "abierta",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    tipo?: string
    descripcion?: string
    urgencia?: string
    usuario_id?: string
    estado?: string
  }>({})

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // Cargar usuario actual
      const user = await getCurrentUser()
      if (user) {
        const currentUserData: Usuario = {
          id: user.id,
          nombre_completo: user.nombre_completo,
          email: user.email,
          departamento: user.departamento || '',
          rol: user.rol
        }
        setCurrentUser(currentUserData)
        setForm(prev => ({ ...prev, usuario_id: user.id }))
      }

      // Cargar residuos - con manejo de errores mejorado
      try {
        const { data: residuosData, error: residuosError } = await supabase
          .from('residuos')
          .select('id, tipo, cantidad, ubicacion, fecha_generacion, estado')
          .eq('estado', 'generado')
          .order('fecha_generacion', { ascending: false })

        if (residuosError) {
          console.warn('Error loading residuos:', residuosError)
          // Continuar sin residuos si la tabla no existe
        } else {
          setResiduos(residuosData?.map(r => ({
            id: r.id,
            codigo: `${r.tipo.substring(0, 3).toUpperCase()}-${r.id.substring(0, 8)}`,
            tipo: r.tipo,
            descripcion: `${r.cantidad}kg en ${r.ubicacion}`,
            peso: r.cantidad,
            departamento: r.ubicacion
          })) || [])
        }
      } catch (residuosErr) {
        console.warn('Residuos table may not exist:', residuosErr)
        setResiduos([])
      }

      // Cargar usuarios activos - con manejo de errores mejorado
      try {
        const { data: usuariosData, error: usuariosError } = await supabase
          .from('users')
          .select('id, nombre_completo, email, departamento, rol')
          .eq('activo', true)
          .order('nombre_completo')

        if (usuariosError) {
          console.warn('Error loading users:', usuariosError)
          // Si hay error, crear lista con solo el usuario actual
          if (user) {
            setUsuarios([{
              id: user.id,
              nombre_completo: user.nombre_completo,
              email: user.email,
              departamento: user.departamento || '',
              rol: user.rol
            }])
          }
        } else {
          setUsuarios(usuariosData || [])
        }
      } catch (usersErr) {
        console.warn('Users table error:', usersErr)
        // Fallback: usar solo el usuario actual
        if (user) {
          setUsuarios([{
            id: user.id,
            nombre_completo: user.nombre_completo,
            email: user.email,
            departamento: user.departamento || '',
            rol: user.rol
          }])
        }
      }

    } catch (error) {
      console.error('Error loading initial data:', error)
      alert('Error al cargar los datos iniciales. Algunos campos pueden no estar disponibles.')
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value })
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validateForm = () => {
    const newErrors: {
      tipo?: string
      descripcion?: string
      urgencia?: string
      usuario_id?: string
      estado?: string
    } = {}
    
    if (!form.tipo) newErrors.tipo = "Selecciona un tipo de incidencia."
    if (!form.descripcion || form.descripcion.length < 10) newErrors.descripcion = "La descripción debe tener al menos 10 caracteres."
    if (!URGENCIAS.map(u => u.value).includes(form.urgencia)) newErrors.urgencia = "Selecciona una urgencia válida."
    if (!form.usuario_id) newErrors.usuario_id = "Selecciona un usuario responsable."
    if (!ESTADOS.map(e => e.value).includes(form.estado)) newErrors.estado = "Selecciona un estado válido."
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from("incidencias")
        .insert({
          tipo: form.tipo,
          descripcion: form.descripcion,
          urgencia: form.urgencia,
          residuo_id: form.residuo_id === "none" ? null : form.residuo_id || null,
          usuario_id: form.usuario_id,
          estado: form.estado,
        })
      
      if (error) throw error

      alert("Incidencia registrada correctamente!")
      router.push("/incidencias")
    } catch (error) {
      console.error('Error creating incidencia:', error)
      alert("Error al registrar incidencia")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Nueva Incidencia</h1>
        <p className="text-muted-foreground">Registra una nueva incidencia en el sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
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
                onChange={handleInputChange}
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {URGENCIAS.map((urgencia) => (
                    <SelectItem key={urgencia.value} value={urgencia.value}>
                      <span className={urgencia.color}>{urgencia.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.urgencia && <div className="text-red-500 text-sm">{errors.urgencia}</div>}
            </div>

            {/* Residuo Relacionado */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Residuo Relacionado (Opcional)
              </Label>
              <Select value={form.residuo_id} onValueChange={(value) => handleSelectChange('residuo_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un residuo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin residuo específico</SelectItem>
                  {residuos.length > 0 ? (
                    residuos.map((residuo) => (
                      <SelectItem key={residuo.id} value={residuo.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{residuo.codigo}</span>
                          <span className="text-sm text-muted-foreground">
                            {residuo.tipo} - {residuo.descripcion}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-residuos" disabled>
                      No hay residuos disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Usuario Responsable */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Usuario Responsable
              </Label>
              <Select value={form.usuario_id} onValueChange={(value) => handleSelectChange('usuario_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el usuario responsable" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.length > 0 ? (
                    usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{usuario.nombre_completo}</span>
                          <span className="text-sm text-muted-foreground">
                            {usuario.departamento ? `${usuario.departamento} - ` : ''}{usuario.rol}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Cargando usuarios...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.usuario_id && <div className="text-red-500 text-sm">{errors.usuario_id}</div>}
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label>Estado Inicial</Label>
              <Select value={form.estado} onValueChange={(value) => handleSelectChange('estado', value)}>
                <SelectTrigger>
                  <SelectValue />
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

            {/* Información del Usuario Actual */}
            {currentUser && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Información del Reportador</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Nombre:</strong> {currentUser.nombre_completo}<br />
                  <strong>Email:</strong> {currentUser.email}<br />
                  <strong>Departamento:</strong> {currentUser.departamento || 'No especificado'}<br />
                  <strong>Rol:</strong> {currentUser.rol}
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Registrando..." : "Registrar Incidencia"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
