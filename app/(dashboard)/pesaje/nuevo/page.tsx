"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, AlertCircle, QrCode, Scale } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { WASTE_TYPES } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  residuo_id: string
  peso: string
  codigo_escaneado: string
  observaciones: string
}

interface FormErrors {
  residuo_id?: string
  peso?: string
  codigo_escaneado?: string
}

interface ResiduoDisponible {
  id: string
  tipo: string
  cantidad: number
  ubicacion: string
  fecha_generacion: string
  usuario: {
    nombre_completo: string
    departamento: string | null
  } | null
  etiquetas: {
    codigo_qr: string
  }[]
}

export default function NuevoPesajePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingResiduos, setLoadingResiduos] = useState(true)
  const [residuosDisponibles, setResiduosDisponibles] = useState<ResiduoDisponible[]>([])
  const [selectedResiduo, setSelectedResiduo] = useState<ResiduoDisponible | null>(null)
  const [formData, setFormData] = useState<FormData>({
    residuo_id: "",
    peso: "",
    codigo_escaneado: "",
    observaciones: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    loadResiduosDisponibles()
  }, [])

  const loadResiduosDisponibles = async () => {
    try {
      // Cargar residuos que están etiquetados pero no pesados
      const { data, error } = await supabase
        .from("residuos")
        .select(`
          id,
          tipo,
          cantidad,
          ubicacion,
          fecha_generacion,
          estado,
          usuario:users!residuos_usuario_id_fkey(nombre_completo, departamento),
          etiquetas(codigo_qr)
        `)
        .in("estado", ["etiquetado", "registrado"])
        .order("fecha_generacion", { ascending: false })

      if (error) throw error

      console.log("Residuos disponibles para pesaje:", data)
      
      // Procesar los datos para que coincidan con la interfaz
      const residuosProcesados = (data || []).map((residuo: any) => ({
        ...residuo,
        usuario: Array.isArray(residuo.usuario) 
          ? residuo.usuario[0] || null
          : residuo.usuario,
        etiquetas: residuo.etiquetas || []
      }))
      
      setResiduosDisponibles(residuosProcesados)
    } catch (error) {
      console.error("Error loading residuos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los residuos disponibles",
        variant: "destructive",
      })
    } finally {
      setLoadingResiduos(false)
    }
  }

  const handleResiduoSelect = (residuoId: string) => {
    const residuo = residuosDisponibles.find(r => r.id === residuoId)
    setSelectedResiduo(residuo || null)
    
    // Auto-completar código QR si existe
    if (residuo?.etiquetas?.[0]?.codigo_qr) {
      setFormData(prev => ({
        ...prev,
        residuo_id: residuoId,
        codigo_escaneado: residuo.etiquetas[0].codigo_qr
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        residuo_id: residuoId,
        codigo_escaneado: ""
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.residuo_id) {
      newErrors.residuo_id = "Debes seleccionar un residuo"
    }

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
      const user = await getCurrentUser()
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Crear el pesaje
      const { data: pesajeData, error: pesajeError } = await supabase
        .from("pesajes")
        .insert({
          residuo_id: formData.residuo_id,
          peso: Number.parseFloat(formData.peso),
          codigo_escaneado: formData.codigo_escaneado,
          observaciones: formData.observaciones || null,
          responsable_id: user.id,
          fecha_hora: new Date().toISOString(),
        })
        .select()
        .single()

      if (pesajeError) throw pesajeError

      // Actualizar estado del residuo a "pesado"
      const { error: updateError } = await supabase
        .from("residuos")
        .update({ estado: "pesado" })
        .eq("id", formData.residuo_id)

      if (updateError) throw updateError

      toast({
        title: "Pesaje registrado",
        description: "El pesaje se ha registrado exitosamente",
      })

      router.push(`/pesaje/${pesajeData.id}`)
    } catch (error) {
      console.error("Error creating pesaje:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el pesaje. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getWasteTypeInfo = (tipo: string) => {
    return WASTE_TYPES.find((w) => w.value === tipo) || { label: tipo, color: "gray" }
  }

  const getDiferenciaPorcentaje = () => {
    if (!selectedResiduo || !formData.peso) return null
    const peso = Number.parseFloat(formData.peso)
    const diferencia = peso - selectedResiduo.cantidad
    return ((Math.abs(diferencia) / selectedResiduo.cantidad) * 100).toFixed(1)
  }

  const getDiferenciaColor = () => {
    const porcentaje = getDiferenciaPorcentaje()
    if (!porcentaje) return "text-muted-foreground"
    const num = Number.parseFloat(porcentaje)
    if (num <= 5) return "text-green-600"
    if (num <= 10) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Pesaje</h1>
          <p className="text-muted-foreground">Registrar el peso real de un residuo médico</p>
        </div>
      </div>

      {/* Alert if no residuos */}
      {!loadingResiduos && residuosDisponibles.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay residuos disponibles para pesaje. Los residuos deben estar etiquetados antes de poder ser pesados.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de Residuo */}
            <Card>
              <CardHeader>
                <CardTitle>Residuo a Pesar</CardTitle>
                <CardDescription>Selecciona el residuo que vas a pesar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Residuo *</Label>
                  <Select 
                    value={formData.residuo_id} 
                    onValueChange={handleResiduoSelect}
                    disabled={loadingResiduos}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingResiduos ? "Cargando..." : "Selecciona un residuo"} />
                    </SelectTrigger>
                    <SelectContent>
                      {residuosDisponibles.map((residuo) => {
                        const wasteType = getWasteTypeInfo(residuo.tipo)
                        return (
                          <SelectItem key={residuo.id} value={residuo.id}>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{wasteType.label}</Badge>
                                <span className="font-medium">{residuo.cantidad} kg</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {residuo.ubicacion} • {residuo.usuario?.nombre_completo || "Usuario no disponible"}
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {errors.residuo_id && (
                    <p className="text-sm text-destructive">{errors.residuo_id}</p>
                  )}
                </div>

                {selectedResiduo && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <h4 className="font-medium">Información del Residuo</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo:</span> {getWasteTypeInfo(selectedResiduo.tipo).label}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Peso estimado:</span> {selectedResiduo.cantidad} kg
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ubicación:</span> {selectedResiduo.ubicacion}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Estado:</span> 
                        <Badge variant="secondary" className="ml-1">
                          {selectedResiduo.etiquetas?.length > 0 ? "Etiquetado" : "Registrado"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Datos del Pesaje */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Pesaje</CardTitle>
                <CardDescription>Introduce los datos obtenidos durante el pesaje</CardDescription>
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
                    {selectedResiduo && formData.peso && (
                      <div className={`text-sm ${getDiferenciaColor()}`}>
                        Diferencia: {getDiferenciaPorcentaje()}% 
                        ({(Number.parseFloat(formData.peso) - selectedResiduo.cantidad).toFixed(2)} kg)
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Código Escaneado *</Label>
                    <div className="relative">
                      <QrCode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Escanea o introduce el código QR"
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
              <Button 
                type="submit" 
                disabled={loading || !selectedResiduo}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Registrar Pesaje
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
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Tolerancias Aceptables</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span>≤ 5%: Excelente precisión</span>
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

              <div>
                <h4 className="font-medium mb-2">Proceso</h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Seleccionar residuo etiquetado</li>
                  <li>Colocar en báscula calibrada</li>
                  <li>Registrar peso exacto</li>
                  <li>Escanear código QR</li>
                  <li>Añadir observaciones si es necesario</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Resumen */}
          {selectedResiduo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Residuo Seleccionado</Label>
                  <p className="font-medium">{getWasteTypeInfo(selectedResiduo.tipo).label}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Peso Estimado</Label>
                  <p className="font-medium">{selectedResiduo.cantidad} kg</p>
                </div>

                {formData.peso && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Peso Real</Label>
                    <p className="font-medium">{formData.peso} kg</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm text-muted-foreground">Ubicación</Label>
                  <p className="font-medium">{selectedResiduo.ubicacion}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
