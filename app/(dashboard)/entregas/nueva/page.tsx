"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Truck, AlertCircle, Package } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { WASTE_TYPES } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

interface GestorExterno {
  id: string
  nombre: string
  licencia: string
  contacto: string
  activo: boolean
}

interface ResiduoPesado {
  id: string
  tipo: string
  cantidad: number
  ubicacion: string
  peso_real: number
  codigo_qr: string
  usuario: {
    nombre_completo: string
  }
  estado?: string
}

export default function NuevaEntregaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [gestores, setGestores] = useState<GestorExterno[]>([])
  const [residuosPesados, setResiduosPesados] = useState<ResiduoPesado[]>([])
  const [selectedGestor, setSelectedGestor] = useState<string>("")
  const [selectedResiduos, setSelectedResiduos] = useState<string[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return

        // Cargar gestores externos activos
        const { data: gestoresData, error: gestoresError } = await supabase
          .from("gestores_externos")
          .select("*")
          .eq("activo", true)
          .order("nombre")

        if (gestoresError) throw gestoresError
        setGestores(gestoresData || [])

        // Cargar residuos disponibles para entrega
        console.log("Iniciando consulta de residuos...")
        
        const { data: residuosData, error: residuosError } = await supabase
          .from("residuos")
          .select(`
            id,
            tipo,
            cantidad,
            ubicacion,
            estado,
            created_at,
            usuario_id
          `)
          .neq("estado", "entregado") // Excluir solo los ya entregados
          .order("created_at", { ascending: false })

        console.log("Residuos encontrados:", residuosData?.length || 0)
        console.log("Residuos query result:", residuosData)
        console.log("Residuos query error:", residuosError)

        if (residuosError) {
          console.error("Error en consulta de residuos:", residuosError)
          throw residuosError
        }

        // Procesar datos para obtener peso real y código QR
        const residuosConPeso = (residuosData || []).map((residuo) => {
          console.log("Procesando residuo:", residuo)
          
          return {
            id: residuo.id,
            tipo: residuo.tipo,
            cantidad: residuo.cantidad,
            ubicacion: residuo.ubicacion,
            peso_real: residuo.cantidad, // Por ahora usar cantidad como peso
            codigo_qr: `QR-${residuo.id.slice(0, 8)}`,
            usuario: { nombre_completo: "Usuario desde DB" },
            estado: residuo.estado,
          }
        })

        console.log("Residuos procesados:", residuosConPeso)
        setResiduosPesados(residuosConPeso)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedGestor) {
      toast({
        title: "Error",
        description: "Selecciona un gestor externo",
        variant: "destructive",
      })
      return
    }

    if (selectedResiduos.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un residuo para entregar",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const user = await getCurrentUser()
      if (!user) throw new Error("Usuario no autenticado")

      // Generar número de seguimiento
      const numeroSeguimiento = `ENT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      // Crear la entrega
      const { data: entregaData, error: entregaError } = await supabase
        .from("entregas")
        .insert({
          gestor_externo_id: selectedGestor,
          usuario_id: user.id,
          estado: "pendiente",
          numero_seguimiento: numeroSeguimiento,
        })
        .select()
        .single()

      if (entregaError) throw entregaError

      // Crear las relaciones entrega-residuos
      const entregaResiduos = selectedResiduos.map((residuoId) => ({
        entrega_id: entregaData.id,
        residuo_id: residuoId,
      }))

      const { error: relacionError } = await supabase.from("entrega_residuos").insert(entregaResiduos)

      if (relacionError) throw relacionError

      // Actualizar estado de los residuos
      const { error: updateError } = await supabase
        .from("residuos")
        .update({ estado: "entregado" })
        .in("id", selectedResiduos)

      if (updateError) throw updateError

      toast({
        title: "Entrega creada",
        description: `Entrega ${numeroSeguimiento} creada exitosamente`,
      })

      router.push(`/entregas/${entregaData.id}`)
    } catch (error) {
      console.error("Error creating entrega:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la entrega. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResiduoToggle = (residuoId: string, checked: boolean | "indeterminate") => {
    const isChecked = checked === true
    if (isChecked) {
      setSelectedResiduos((prev) => [...prev, residuoId])
    } else {
      setSelectedResiduos((prev) => prev.filter((id) => id !== residuoId))
    }
  }

  const selectedGestorData = gestores.find((g) => g.id === selectedGestor)
  const selectedResiduosData = residuosPesados.filter((r) => selectedResiduos.includes(r.id))
  const pesoTotal = selectedResiduosData.reduce((sum, r) => sum + r.peso_real, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Entrega</h1>
          <p className="text-muted-foreground">Crear entrega a gestor externo autorizado</p>
        </div>
      </div>

      {/* Alert if no residuos */}
      {residuosPesados.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay residuos disponibles para entrega. 
            <br />
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal underline" 
              onClick={() => window.open('/test/residuos', '_blank')}
            >
              Crear residuos de prueba aquí
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Debug info - temporal */}
      {process.env.NODE_ENV === 'development' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Debug:</strong> Se encontraron {residuosPesados.length} residuos disponibles.
            {residuosPesados.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer">Ver residuos</summary>
                <pre className="text-xs mt-2 p-2 bg-muted rounded">
                  {JSON.stringify(residuosPesados.slice(0, 3), null, 2)}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Gestor Externo */}
            <Card>
              <CardHeader>
                <CardTitle>Gestor Externo</CardTitle>
                <CardDescription>Selecciona el gestor autorizado para el tratamiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Gestor Externo *</Label>
                  <Select value={selectedGestor} onValueChange={setSelectedGestor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un gestor externo" />
                    </SelectTrigger>
                    <SelectContent>
                      {gestores.map((gestor) => (
                        <SelectItem key={gestor.id} value={gestor.id}>
                          <div className="space-y-1">
                            <div className="font-medium">{gestor.nombre}</div>
                            <div className="text-sm text-muted-foreground">Licencia: {gestor.licencia}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGestorData && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Información del Gestor</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nombre:</span> {selectedGestorData.nombre}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Licencia:</span> {selectedGestorData.licencia}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contacto:</span> {selectedGestorData.contacto}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selección de Residuos */}
            <Card>
              <CardHeader>
                <CardTitle>Residuos a Entregar</CardTitle>
                <CardDescription>Selecciona los residuos pesados que serán entregados</CardDescription>
              </CardHeader>
              <CardContent>
                {residuosPesados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay residuos disponibles para entrega</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {residuosPesados.map((residuo) => {
                      const wasteType = WASTE_TYPES.find((w) => w.value === residuo.tipo)
                      return (
                        <div key={residuo.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={residuo.id}
                            checked={selectedResiduos.includes(residuo.id)}
                            onCheckedChange={(checked) => handleResiduoToggle(residuo.id, checked)}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              {wasteType && <div className={`h-3 w-3 rounded-full bg-${wasteType.color}-500`} />}
                              <Badge variant="outline">{wasteType?.label || residuo.tipo}</Badge>
                              <Badge variant="secondary" className="text-xs">
                                {residuo.estado}
                              </Badge>
                              <code className="text-xs text-muted-foreground">{residuo.codigo_qr}</code>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {residuo.ubicacion} • {residuo.peso_real.toFixed(2)} kg •{" "}
                              {residuo.usuario.nombre_completo}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading || residuosPesados.length === 0} className="flex-1">
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Creando entrega...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear Entrega
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
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Gestor Seleccionado</Label>
                <p className="font-medium">{selectedGestorData?.nombre || "Ninguno"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Residuos Seleccionados</Label>
                <p className="font-medium">{selectedResiduos.length} residuo(s)</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Peso Total</Label>
                <p className="font-medium">{pesoTotal.toFixed(2)} kg</p>
              </div>

              {selectedResiduosData.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Tipos de Residuo</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Array.from(new Set(selectedResiduosData.map((r) => r.tipo))).map((tipo) => {
                      const wasteType = WASTE_TYPES.find((w) => w.value === tipo)
                      return (
                        <Badge key={tipo} variant="secondary" className="text-xs">
                          {wasteType?.label || tipo}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Proceso de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">1. Crear entrega</p>
                  <p className="text-muted-foreground">Se genera número de seguimiento</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-gray-300 rounded-full mt-2" />
                <div>
                  <p className="font-medium">2. Confirmación del gestor</p>
                  <p className="text-muted-foreground">El gestor confirma la recepción</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-gray-300 rounded-full mt-2" />
                <div>
                  <p className="font-medium">3. Tratamiento</p>
                  <p className="text-muted-foreground">Procesamiento según normativa</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-gray-300 rounded-full mt-2" />
                <div>
                  <p className="font-medium">4. Certificado final</p>
                  <p className="text-muted-foreground">Documento de tratamiento completo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
