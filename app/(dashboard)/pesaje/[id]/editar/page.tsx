"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, AlertCircle, Scale, QrCode, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { WASTE_TYPES } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FormData {
  peso: string
  codigo_escaneado: string
  observaciones: string
}

interface FormErrors {
  peso?: string
  codigo_escaneado?: string
}

interface PesajeData {
  id: string
  peso: number
  codigo_escaneado: string
  observaciones: string | null
  fecha_hora: string
  residuo: {
    id: string
    tipo: string
    cantidad: number
    ubicacion: string
    usuario: {
      nombre_completo: string
    } | null
  }
  responsable: {
    nombre_completo: string
    departamento: string | null
  } | null
}

export default function EditarPesajePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pesaje, setPesaje] = useState<PesajeData | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<FormData>({
    peso: "",
    codigo_escaneado: "",
    observaciones: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        if (user && params.id) {
          await loadPesaje(params.id as string, user)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Error al cargar los datos del pesaje",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [params.id, toast])

  const loadPesaje = async (pesajeId: string, user: User) => {
    try {
      const { data, error } = await supabase
        .from("pesajes")
        .select(`
          *,
          residuo:residuos(
            id, tipo, cantidad, ubicacion,
            usuario:users!residuos_usuario_id_fkey(nombre_completo)
          ),
          responsable:users!pesajes_responsable_id_fkey(nombre_completo, departamento)
        `)
        .eq("id", pesajeId)
        .single()

      if (error) throw error

      // Verificar permisos
      if (user.rol === "transportista" && data.responsable_id !== user.id) {
        throw new Error("No tienes permisos para editar este pesaje")
      }

      setPesaje(data)
      setFormData({
        peso: data.peso.toString(),
        codigo_escaneado: data.codigo_escaneado,
        observaciones: data.observaciones || "",
      })
    } catch (error) {
      console.error("Error loading pesaje:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el pesaje",
        variant: "destructive",
      })
      router.push("/pesaje")
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.peso) {
      newErrors.peso = "El peso es obligatorio"
    } else {
      const peso = Number.parseFloat(formData.peso)
      if (isNaN(peso) || peso <= 0) {
        newErrors.peso = "El peso debe ser un número mayor a 0"
      } else if (peso > 1000) {
        newErrors.peso = "El peso parece excesivo (máximo 1000 kg)"
      }
    }

    if (!formData.codigo_escaneado) {
      newErrors.codigo_escaneado = "El código escaneado es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor corrige los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from("pesajes")
        .update({
          peso: Number.parseFloat(formData.peso),
          codigo_escaneado: formData.codigo_escaneado,
          observaciones: formData.observaciones || null,
        })
        .eq("id", params.id)

      if (error) throw error

      toast({
        title: "Pesaje actualizado",
        description: "Los datos del pesaje se han actualizado exitosamente",
      })

      router.push(`/pesaje/${params.id}`)
    } catch (error) {
      console.error("Error updating pesaje:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el pesaje. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!pesaje) return

    setDeleteLoading(true)

    try {
      // Revertir estado del residuo a "etiquetado" o "registrado"
      const nuevoEstado = pesaje.residuo.ubicacion ? "etiquetado" : "registrado"
      
      const { error: residuoError } = await supabase
        .from("residuos")
        .update({ estado: nuevoEstado })
        .eq("id", pesaje.residuo.id)

      if (residuoError) throw residuoError

      // Eliminar el pesaje
      const { error: deleteError } = await supabase
        .from("pesajes")
        .delete()
        .eq("id", params.id)

      if (deleteError) throw deleteError

      toast({
        title: "Pesaje eliminado",
        description: "El pesaje se ha eliminado y el residuo ha vuelto a su estado anterior",
      })

      router.push("/pesaje")
    } catch (error) {
      console.error("Error deleting pesaje:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el pesaje. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const getWasteTypeInfo = (tipo: string) => {
    return WASTE_TYPES.find((w) => w.value === tipo) || { label: tipo, color: "gray" }
  }

  const getDiferenciaPorcentaje = () => {
    if (!pesaje || !formData.peso) return null
    const peso = Number.parseFloat(formData.peso)
    const diferencia = peso - pesaje.residuo.cantidad
    return ((Math.abs(diferencia) / pesaje.residuo.cantidad) * 100).toFixed(1)
  }

  const getDiferenciaColor = () => {
    const porcentaje = getDiferenciaPorcentaje()
    if (!porcentaje) return "text-muted-foreground"
    const num = Number.parseFloat(porcentaje)
    if (num <= 5) return "text-green-600"
    if (num <= 10) return "text-yellow-600"
    return "text-red-600"
  }

  if (loadingData) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando datos del pesaje...</div>
      </div>
    )
  }

  if (!pesaje) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No se pudo cargar el pesaje</AlertDescription>
        </Alert>
      </div>
    )
  }

  const wasteType = getWasteTypeInfo(pesaje.residuo.tipo)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Editar Pesaje</h1>
          <p className="text-muted-foreground">
            Modificar los datos del pesaje {pesaje.codigo_escaneado}
          </p>
        </div>
        {currentUser && ["supervisor", "admin"].includes(currentUser.rol) && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteLoading ? "Eliminando..." : "Eliminar"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar pesaje?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El pesaje será eliminado permanentemente y el residuo 
                  volverá a su estado anterior.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Residuo (solo lectura) */}
            <Card>
              <CardHeader>
                <CardTitle>Residuo Asociado</CardTitle>
                <CardDescription>Información del residuo (no editable)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-muted-foreground">Tipo</Label>
                    <Badge variant="outline" className="mt-1">
                      {wasteType.label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Peso Estimado</Label>
                    <p className="font-medium">{pesaje.residuo.cantidad} kg</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Ubicación</Label>
                    <p className="font-medium">{pesaje.residuo.ubicacion}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Generado por</Label>
                    <p className="font-medium">
                      {pesaje.residuo.usuario?.nombre_completo || "Usuario no disponible"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos del Pesaje (editables) */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Pesaje</CardTitle>
                <CardDescription>Modifica los datos registrados durante el pesaje</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Peso Real (kg) *</Label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.peso}
                        onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                    {errors.peso && <p className="text-sm text-destructive">{errors.peso}</p>}
                    
                    {/* Mostrar diferencia */}
                    {formData.peso && (
                      <div className={`text-sm ${getDiferenciaColor()}`}>
                        Diferencia: {getDiferenciaPorcentaje()}% 
                        ({(Number.parseFloat(formData.peso) - pesaje.residuo.cantidad).toFixed(2)} kg)
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Código Escaneado *</Label>
                    <div className="relative">
                      <QrCode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Código QR escaneado"
                        value={formData.codigo_escaneado}
                        onChange={(e) => setFormData({ ...formData, codigo_escaneado: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                    {errors.codigo_escaneado && (
                      <p className="text-sm text-destructive">{errors.codigo_escaneado}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Textarea
                    placeholder="Notas adicionales sobre el pesaje (opcional)"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Actualizar Pesaje
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">Fecha de Pesaje</Label>
                <p className="font-medium">
                  {new Date(pesaje.fecha_hora).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Responsable</Label>
                <p className="font-medium">
                  {pesaje.responsable?.nombre_completo || "No disponible"}
                </p>
                {pesaje.responsable?.departamento && (
                  <p className="text-sm text-muted-foreground">
                    {pesaje.responsable.departamento}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Análisis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Análisis de Precisión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Tolerancias</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span>≤ 5%: Excelente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                    <span>5-10%: Aceptable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full" />
                    <span>{">"}10%: Revisar</span>
                  </div>
                </div>
              </div>

              {formData.peso && (
                <div>
                  <h4 className="font-medium mb-2">Diferencia Actual</h4>
                  <p className={getDiferenciaColor()}>
                    {getDiferenciaPorcentaje()}% de variación
                  </p>
                  <p className="text-muted-foreground">
                    {(Number.parseFloat(formData.peso) - pesaje.residuo.cantidad).toFixed(2)} kg de diferencia
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
