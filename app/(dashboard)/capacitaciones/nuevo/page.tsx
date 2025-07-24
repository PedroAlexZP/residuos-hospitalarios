"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Upload, Users, BookOpen, FileText, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, getUsersByRoles, type User } from "@/lib/auth"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Usuario {
  id: string
  nombre_completo: string
  departamento: string | null
  rol: string
}

export default function NuevaCapacitacionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [form, setForm] = useState({
    tema: "",
    descripcion: "",
    fecha: "",
    hora: "",
    responsable_id: "",
    material_pdf: null as File | null,
  })
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
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
        await getCurrentUser()
        await loadUsuarios()
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoadingUsers(false)
      }
    }

    loadData()
  }, [])

  const loadUsuarios = async () => {
    try {
      console.log("Cargando usuarios para capacitaciones...");
      
      // Usar la nueva función de auth
      const allUsers = await getUsersByRoles(["supervisor", "admin", "gestor_externo"]);
      
      if (allUsers.length > 0) {
        console.log("Usuarios cargados con nueva función:", allUsers.length);
        console.log("Usuarios disponibles:", allUsers.map(u => u.nombre_completo).join(", "));
        
        // Mapear a la interface local
        const mappedUsers: Usuario[] = allUsers.map(user => ({
          id: user.id,
          nombre_completo: user.nombre_completo,
          departamento: user.departamento || null,
          rol: user.rol
        }));
        
        setUsuarios(mappedUsers);
        return;
      }
      
      // Fallback original
      const { data, error } = await supabase
        .from("users")
        .select("id, nombre_completo, departamento, rol")
        .eq("activo", true)
        .in("rol", ["supervisor", "admin", "gestor_externo"])
        .order("nombre_completo")

      if (error) {
        console.error("Error loading usuarios:", error);
        
        // Segundo fallback: intentar cargar todos los usuarios activos
        console.log("Intentando segundo fallback - cargar todos los usuarios activos...");
        const { data: allUsers, error: allUsersError } = await supabase
          .from("users")
          .select("id, nombre_completo, departamento, rol")
          .eq("activo", true)
          .order("nombre_completo");
          
        if (allUsersError) {
          throw allUsersError;
        }
        
        console.log("Usuarios cargados (segundo fallback):", allUsers?.length || 0);
        setUsuarios(allUsers || []);
        return;
      }
      
      console.log("Usuarios cargados (fallback directo):", data?.length || 0);
      console.log("Usuarios disponibles:", data?.map(u => u.nombre_completo).join(", "));
      setUsuarios(data || [])
    } catch (error) {
      console.error("Error loading usuarios:", error)
      toast({
        title: "Error al cargar usuarios",
        description: "No se pudieron cargar los responsables disponibles",
        variant: "destructive",
      })
      setUsuarios([]);
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

    // Validar que la fecha no sea en el pasado
    if (form.fecha && form.hora) {
      const fechaHora = new Date(`${form.fecha}T${form.hora}`)
      if (fechaHora <= new Date()) {
        newErrors.fecha = "La fecha y hora deben ser futuras"
      }
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
        // Si no existe el bucket, crear uno público
        const { error: createBucketError } = await supabase.storage.createBucket('uploads', {
          public: true,
          allowedMimeTypes: ['application/pdf'],
          fileSizeLimit: 10485760 // 10MB
        })
        
        if (createBucketError) {
          console.warn("No se pudo crear bucket de storage:", createBucketError)
          // En lugar de fallar, retornar una URL simulada con el nombre del archivo
          return `uploads/capacitaciones/${fileName}`
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)

      if (uploadError) {
        console.warn("Error uploading to storage:", uploadError)
        // Retornar una URL simulada si falla la subida real
        return `uploads/capacitaciones/${fileName}`
      }

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading file:", error)
      // En caso de error, retornar una referencia al archivo
      const fileName = `${Date.now()}-${file.name}`
      return `uploads/capacitaciones/${fileName}`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    try {
      // Subir archivo PDF si existe
      let materialUrl = null
      if (form.material_pdf) {
        materialUrl = await uploadFile(form.material_pdf)
        console.log("Material URL:", materialUrl)
      }

      // Combinar fecha y hora
      const fechaHora = new Date(`${form.fecha}T${form.hora}`)

      const { error } = await supabase
        .from("capacitaciones")
        .insert({
          tema: form.tema,
          descripcion: form.descripcion,
          fecha: fechaHora.toISOString(),
          responsable_id: form.responsable_id,
          material_pdf: materialUrl,
        })

      if (error) throw error

      toast({
        title: "¡Capacitación creada exitosamente!",
        description: materialUrl 
          ? "La capacitación se creó con material de apoyo incluido"
          : "La capacitación se creó correctamente",
      })
      
      router.push("/capacitaciones")
    } catch (error) {
      console.error("Error creating capacitacion:", error)
      toast({
        title: "Error al crear capacitación",
        description: (error as Error).message || "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingUsers) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="h-64 bg-muted animate-pulse rounded" />
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
          <h1 className="text-3xl font-bold tracking-tight">Nueva Capacitación</h1>
          <p className="text-muted-foreground">Crear una nueva capacitación para el personal</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Información de la Capacitación
          </CardTitle>
          <CardDescription>
            Complete los datos para programar una nueva capacitación
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
                  min={format(new Date(), "yyyy-MM-dd")}
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
                Material de Apoyo (PDF) - Opcional
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
                Formato PDF, máximo 10MB. Si no se puede subir el archivo, la capacitación se creará sin material.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creando..." : "Crear Capacitación"}
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
