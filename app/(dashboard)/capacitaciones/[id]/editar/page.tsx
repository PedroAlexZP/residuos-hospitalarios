"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Upload, Users, BookOpen, FileText, ArrowLeft, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface Usuario {
  id: string
  nombre_completo: string
  departamento: string | null
  rol: string
}

interface CapacitacionData {
  id: string
  tema: string
  descripcion: string
  fecha: string
  responsable_id: string
  material_pdf: string | null
  created_at: string
  responsable: {
    id: string
    nombre_completo: string
    departamento: string | null
    rol: string
  } | null
}

export default function EditarCapacitacionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [capacitacionOriginal, setCapacitacionOriginal] = useState<CapacitacionData | null>(null)
  const [form, setForm] = useState({
    tema: "",
    descripcion: "",
    fecha: "",
    hora: "",
    responsable_id: "",
    material_pdf: null as File | null,
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState<{
    tema?: string
    descripcion?: string
    fecha?: string
    hora?: string
    responsable_id?: string
  }>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        
        // Verificar permisos
        if (!["supervisor", "admin"].includes(currentUser?.rol || "")) {
          toast({
            title: "Sin permisos",
            description: "No tiene permisos para editar capacitaciones",
            variant: "destructive",
          })
          router.push("/capacitaciones")
          return
        }

        await Promise.all([
          loadCapacitacion(),
          loadUsuarios()
        ])
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [id])

  const loadCapacitacion = async () => {
    try {
      const { data, error } = await supabase
        .from("capacitaciones")
        .select(`
          *,
          responsable:users!capacitaciones_responsable_id_fkey(
            id, nombre_completo, departamento, rol
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      
      setCapacitacionOriginal(data)
      
      const fechaObj = new Date(data.fecha)
      const fechaStr = format(fechaObj, "yyyy-MM-dd")
      const horaStr = format(fechaObj, "HH:mm")
      
      setForm({
        tema: data.tema || "",
        descripcion: data.descripcion || "",
        fecha: fechaStr,
        hora: horaStr,
        responsable_id: data.responsable_id || "",
        material_pdf: null,
      })
    } catch (error) {
      console.error("Error loading capacitacion:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la capacitación",
        variant: "destructive",
      })
    }
  }

  const loadUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, nombre_completo, departamento, rol")
        .eq("activo", true)
        .in("rol", ["supervisor", "admin", "gestor_externo"])
        .order("nombre_completo")

      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error("Error loading usuarios:", error)
      toast({
        title: "Error al cargar usuarios",
        description: "No se pudieron cargar los responsables disponibles",
        variant: "destructive",
      })
    }
  }

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value })
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea PDF
      if (file.type !== "application/pdf") {
        toast({
          title: "Archivo no válido",
          description: "Solo se permiten archivos PDF",
          variant: "destructive",
        })
        return
      }
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo no puede ser mayor a 10MB",
          variant: "destructive",
        })
        return
      }
      setForm({ ...form, material_pdf: file })
      toast({
        title: "Archivo seleccionado",
        description: `Archivo ${file.name} listo para subir`,
      })
    }
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    if (!form.tema || form.tema.length < 3) {
      newErrors.tema = "El tema debe tener al menos 3 caracteres"
    }
    
    if (!form.descripcion || form.descripcion.length < 10) {
      newErrors.descripcion = "La descripción debe tener al menos 10 caracteres"
    }
    
    if (!form.fecha) {
      newErrors.fecha = "La fecha es obligatoria"
    }
    
    if (!form.hora) {
      newErrors.hora = "La hora es obligatoria"
    }
    
    if (!form.responsable_id) {
      newErrors.responsable_id = "Debe seleccionar un responsable"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `capacitaciones/${fileName}`

      // Intentar crear el bucket si no existe
      const { data: buckets } = await supabase.storage.listBuckets()
      const uploadsBucket = buckets?.find(bucket => bucket.name === 'uploads')
      
      if (!uploadsBucket) {
        const { error: createBucketError } = await supabase.storage.createBucket('uploads', {
          public: true,
          allowedMimeTypes: ['application/pdf'],
          fileSizeLimit: 10485760 // 10MB
        })
        
        if (createBucketError) {
          console.warn("No se pudo crear bucket de storage:", createBucketError)
          return `uploads/capacitaciones/${fileName}`
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)

      if (uploadError) {
        console.warn("Error uploading to storage:", uploadError)
        return `uploads/capacitaciones/${fileName}`
      }

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading file:", error)
      const fileName = `${Date.now()}-${file.name}`
      return `uploads/capacitaciones/${fileName}`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    try {
      // Subir archivo PDF si se seleccionó uno nuevo
      let materialUrl = capacitacionOriginal?.material_pdf || null
      if (form.material_pdf) {
        const newMaterialUrl = await uploadFile(form.material_pdf)
        if (newMaterialUrl) {
          materialUrl = newMaterialUrl
        }
      }

      // Combinar fecha y hora
      const fechaHora = new Date(`${form.fecha}T${form.hora}`)

      const { error } = await supabase
        .from("capacitaciones")
        .update({
          tema: form.tema,
          descripcion: form.descripcion,
          fecha: fechaHora.toISOString(),
          responsable_id: form.responsable_id,
          material_pdf: materialUrl,
        })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "¡Capacitación actualizada exitosamente!",
        description: "Los cambios se han guardado correctamente",
      })
      
      router.push(`/capacitaciones/${id}`)
    } catch (error) {
      console.error("Error updating capacitacion:", error)
      toast({
        title: "Error al actualizar capacitación",
        description: (error as Error).message || "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-8 bg-muted animate-pulse rounded w-64" />
            <div className="h-4 bg-muted animate-pulse rounded w-80" />
          </div>
        </div>
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!capacitacionOriginal) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Capacitación no encontrada</h2>
          <p className="text-muted-foreground">La capacitación que intenta editar no existe</p>
        </div>
        <Button onClick={() => router.push("/capacitaciones")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Capacitaciones
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Capacitación</h1>
          <p className="text-muted-foreground">Modificar los detalles de la capacitación</p>
        </div>
      </div>

      {/* Información Original */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <BookOpen className="h-5 w-5" />
            Información Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Tema actual:</span>
              <p>{capacitacionOriginal.tema}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Responsable actual:</span>
              <p>{capacitacionOriginal.responsable?.nombre_completo || "No disponible"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Fecha actual:</span>
              <p>{format(new Date(capacitacionOriginal.fecha), "dd/MM/yyyy HH:mm")}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Material actual:</span>
              <p>{capacitacionOriginal.material_pdf ? "PDF disponible" : "Sin material"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nueva Información
          </CardTitle>
          <CardDescription>
            Complete los campos que desea modificar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tema */}
            <div className="space-y-2">
              <Label htmlFor="tema">Tema *</Label>
              <Input
                id="tema"
                placeholder="Ej: Manejo de Residuos Infecciosos"
                value={form.tema}
                onChange={(e) => handleChange("tema", e.target.value)}
              />
              {errors.tema && (
                <Alert>
                  <AlertDescription className="text-red-600">{errors.tema}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción detallada de los objetivos y contenido de la capacitación..."
                value={form.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                rows={4}
              />
              {errors.descripcion && (
                <Alert>
                  <AlertDescription className="text-red-600">{errors.descripcion}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Fecha *
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={form.fecha}
                  onChange={(e) => handleChange("fecha", e.target.value)}
                />
                {errors.fecha && (
                  <Alert>
                    <AlertDescription className="text-red-600">{errors.fecha}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora">Hora *</Label>
                <Input
                  id="hora"
                  type="time"
                  value={form.hora}
                  onChange={(e) => handleChange("hora", e.target.value)}
                />
                {errors.hora && (
                  <Alert>
                    <AlertDescription className="text-red-600">{errors.hora}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Responsable */}
            <div className="space-y-2">
              <Label htmlFor="responsable_id">
                <Users className="h-4 w-4 inline mr-1" />
                Responsable *
              </Label>
              <Select value={form.responsable_id} onValueChange={(value) => handleChange("responsable_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      <div className="flex flex-col">
                        <span>{usuario.nombre_completo}</span>
                        <span className="text-sm text-muted-foreground">
                          {usuario.departamento} - {usuario.rol}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.responsable_id && (
                <Alert>
                  <AlertDescription className="text-red-600">{errors.responsable_id}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Material PDF */}
            <div className="space-y-2">
              <Label htmlFor="material_pdf">
                <FileText className="h-4 w-4 inline mr-1" />
                Nuevo Material de Apoyo (PDF) - Opcional
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="material_pdf"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {form.material_pdf && (
                <p className="text-sm text-muted-foreground">
                  Archivo seleccionado: {form.material_pdf.name}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Si no selecciona un archivo, se mantendrá el material actual. 
                Formato PDF, máximo 10MB.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
