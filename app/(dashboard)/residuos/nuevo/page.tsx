"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, AlertCircle, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { WASTE_TYPES, DEPARTMENTS } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  tipo: string
  cantidad: string
  ubicacion: string
  fecha_generacion: string
  observaciones: string
}

interface FormErrors {
  tipo?: string
  cantidad?: string
  ubicacion?: string
  fecha_generacion?: string
}

export default function NuevoResiduoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    tipo: "",
    cantidad: "",
    ubicacion: "",
    fecha_generacion: new Date().toISOString().slice(0, 16),
    observaciones: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.tipo) {
      newErrors.tipo = "El tipo de residuo es obligatorio"
    }

    if (!formData.cantidad) {
      newErrors.cantidad = "La cantidad es obligatoria"
    } else {
      const cantidad = Number.parseFloat(formData.cantidad)
      if (isNaN(cantidad) || cantidad <= 0) {
        newErrors.cantidad = "La cantidad debe ser un número mayor a 0"
      }
    }

    if (!formData.ubicacion) {
      newErrors.ubicacion = "La ubicación es obligatoria"
    }

    if (!formData.fecha_generacion) {
      newErrors.fecha_generacion = "La fecha de generación es obligatoria"
    } else {
      const fechaGeneracion = new Date(formData.fecha_generacion)
      const ahora = new Date()
      if (fechaGeneracion > ahora) {
        newErrors.fecha_generacion = "La fecha no puede ser futura"
      }
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
      const user = await getCurrentUser()
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      const { data, error } = await supabase
        .from("residuos")
        .insert({
          tipo: formData.tipo,
          cantidad: Number.parseFloat(formData.cantidad),
          ubicacion: formData.ubicacion,
          fecha_generacion: formData.fecha_generacion,
          usuario_id: user.id,
          estado: "generado",
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Residuo registrado",
        description: "El residuo ha sido registrado exitosamente",
      })

      router.push(`/residuos/${data.id}`)
    } catch (error) {
      console.error("Error creating residuo:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el residuo. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const selectedWasteType = WASTE_TYPES.find((type) => type.value === formData.tipo)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registrar Nuevo Residuo</h1>
          <p className="text-muted-foreground">Completa la información del residuo hospitalario</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Asegúrate de clasificar correctamente el residuo según las normativas hospitalarias vigentes. La información
          registrada será utilizada para la trazabilidad completa del residuo.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Residuo</CardTitle>
              <CardDescription>Todos los campos marcados con (*) son obligatorios</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de Residuo */}
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Residuo *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                    <SelectTrigger className={errors.tipo ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona el tipo de residuo" />
                    </SelectTrigger>
                    <SelectContent>
                      {WASTE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full bg-${type.color}-500`} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipo && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.tipo}
                    </p>
                  )}
                </div>

                {/* Cantidad */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad (kg) *</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.cantidad}
                    onChange={(e) => handleInputChange("cantidad", e.target.value)}
                    className={errors.cantidad ? "border-red-500" : ""}
                  />
                  {errors.cantidad && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.cantidad}
                    </p>
                  )}
                </div>

                {/* Ubicación */}
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación *</Label>
                  <Select value={formData.ubicacion} onValueChange={(value) => handleInputChange("ubicacion", value)}>
                    <SelectTrigger className={errors.ubicacion ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona la ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ubicacion && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.ubicacion}
                    </p>
                  )}
                </div>

                {/* Fecha de Generación */}
                <div className="space-y-2">
                  <Label htmlFor="fecha_generacion">Fecha y Hora de Generación *</Label>
                  <Input
                    id="fecha_generacion"
                    type="datetime-local"
                    value={formData.fecha_generacion}
                    onChange={(e) => handleInputChange("fecha_generacion", e.target.value)}
                    className={errors.fecha_generacion ? "border-red-500" : ""}
                  />
                  {errors.fecha_generacion && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.fecha_generacion}
                    </p>
                  )}
                </div>

                {/* Observaciones */}
                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Información adicional sobre el residuo (opcional)"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange("observaciones", e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Registrar Residuo
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          {selectedWasteType && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vista Previa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Tipo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-3 w-3 rounded-full bg-${selectedWasteType.color}-500`} />
                    <Badge variant="outline">{selectedWasteType.label}</Badge>
                  </div>
                </div>

                {formData.cantidad && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Cantidad</Label>
                    <p className="font-medium">{formData.cantidad} kg</p>
                  </div>
                )}

                {formData.ubicacion && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Ubicación</Label>
                    <p className="font-medium">{formData.ubicacion}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guías de Clasificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Badge variant="outline" className="mb-2">
                  Anatomopatológicos
                </Badge>
                <p className="text-muted-foreground">Tejidos, órganos, partes del cuerpo</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">
                  Cortopunzantes
                </Badge>
                <p className="text-muted-foreground">Agujas, bisturís, vidrios rotos</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">
                  Farmacéuticos
                </Badge>
                <p className="text-muted-foreground">Medicamentos vencidos o no utilizados</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">
                  Citotóxicos
                </Badge>
                <p className="text-muted-foreground">Medicamentos oncológicos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
