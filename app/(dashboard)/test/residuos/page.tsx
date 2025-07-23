"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { WASTE_TYPES } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

export default function TestResiduosPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [tipo, setTipo] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [ubicacion, setUbicacion] = useState("")

  const handleCreateTestResiduos = async () => {
    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        toast({
          title: "Error",
          description: "Usuario no autenticado",
          variant: "destructive",
        })
        return
      }

      // Crear residuos de prueba
      const residuosPrueba = [
        {
          tipo: "patologicos",
          cantidad: 2.5,
          ubicacion: "Quirófano 1",
          estado: "registrado",
          usuario_id: user.id,
        },
        {
          tipo: "infecciosos",
          cantidad: 1.8,
          ubicacion: "UCI",
          estado: "etiquetado", 
          usuario_id: user.id,
        },
        {
          tipo: "cortopunzantes",
          cantidad: 0.5,
          ubicacion: "Laboratorio",
          estado: "pesado",
          usuario_id: user.id,
        },
        {
          tipo: "farmaceuticos",
          cantidad: 3.2,
          ubicacion: "Farmacia",
          estado: "registrado",
          usuario_id: user.id,
        },
        {
          tipo: "quimioterapicos",
          cantidad: 1.0,
          ubicacion: "Oncología",
          estado: "etiquetado",
          usuario_id: user.id,
        }
      ]

      const { data, error } = await supabase
        .from("residuos")
        .insert(residuosPrueba)
        .select()

      if (error) throw error

      toast({
        title: "Éxito",
        description: `Se crearon ${data.length} residuos de prueba`,
      })

    } catch (error) {
      console.error("Error creating test residuos:", error)
      toast({
        title: "Error",
        description: "No se pudieron crear los residuos de prueba",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSingleResiduo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipo || !cantidad || !ubicacion) return

    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error("Usuario no autenticado")

      const { data, error } = await supabase
        .from("residuos")
        .insert({
          tipo,
          cantidad: parseFloat(cantidad),
          ubicacion,
          estado: "registrado",
          usuario_id: user.id,
        })
        .select()

      if (error) throw error

      toast({
        title: "Residuo creado",
        description: "El residuo se creó exitosamente",
      })

      // Limpiar formulario
      setTipo("")
      setCantidad("")
      setUbicacion("")

    } catch (error) {
      console.error("Error creating residuo:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el residuo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test - Crear Residuos</h1>
        <p className="text-muted-foreground">Página para crear residuos de prueba</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear Residuos de Prueba</CardTitle>
            <CardDescription>
              Crear múltiples residuos con diferentes estados para probar el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleCreateTestResiduos} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Creando..." : "Crear 5 Residuos de Prueba"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crear Residuo Individual</CardTitle>
            <CardDescription>Crear un residuo específico</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSingleResiduo} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Residuo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {WASTE_TYPES.map((wasteType) => (
                      <SelectItem key={wasteType.value} value={wasteType.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full bg-${wasteType.color}-500`} />
                          {wasteType.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cantidad (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Ej: Quirófano 1"
                />
              </div>

              <Button type="submit" disabled={loading || !tipo || !cantidad || !ubicacion}>
                {loading ? "Creando..." : "Crear Residuo"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
