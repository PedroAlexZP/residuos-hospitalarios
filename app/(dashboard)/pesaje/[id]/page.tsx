"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Scale,
  QrCode,
  User as UserIcon,
  Calendar,
  MapPin,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Edit,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { WASTE_TYPES } from "@/lib/constants"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface PesajeDetalle {
  id: string
  peso: number
  fecha_hora: string
  codigo_escaneado: string
  observaciones: string | null
  responsable: {
    id: string
    nombre_completo: string
    departamento: string | null
    email: string
  } | null
  residuo: {
    id: string
    tipo: string
    cantidad: number
    ubicacion: string
    fecha_generacion: string
    estado: string
    usuario: {
      nombre_completo: string
      departamento: string | null
    } | null
  }
}

export default function PesajeDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [pesaje, setPesaje] = useState<PesajeDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

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
        setError("Error al cargar los datos del pesaje")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  const loadPesaje = async (pesajeId: string, user: User) => {
    try {
      let query = supabase
        .from("pesajes")
        .select(`
          *,
          responsable:users!pesajes_responsable_id_fkey(id, nombre_completo, departamento, email),
          residuo:residuos(
            id, tipo, cantidad, ubicacion, fecha_generacion, estado,
            usuario:users!residuos_usuario_id_fkey(nombre_completo, departamento)
          )
        `)
        .eq("id", pesajeId)

      // Filtrar por permisos de usuario
      if (user.rol === "transportista") {
        query = query.eq("responsable_id", user.id)
      }

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError("Pesaje no encontrado o no tienes permisos para verlo")
        } else {
          throw error
        }
        return
      }

      console.log("Pesaje cargado:", data)
      setPesaje(data)
    } catch (error) {
      console.error("Error loading pesaje:", error)
      setError("Error al cargar los detalles del pesaje")
    }
  }

  const getWasteTypeInfo = (tipo: string) => {
    return WASTE_TYPES.find((w) => w.value === tipo) || { label: tipo, color: "gray" }
  }

  const getDiferenciaInfo = () => {
    if (!pesaje) return null
    
    const diferencia = pesaje.peso - pesaje.residuo.cantidad
    const porcentaje = Math.abs((diferencia / pesaje.residuo.cantidad) * 100)
    
    let status: "excellent" | "good" | "warning" | "danger" = "excellent"
    let label = "Excelente"
    let icon = CheckCircle
    let color = "text-green-600"
    
    if (porcentaje > 10) {
      status = "danger"
      label = "Revisar"
      icon = AlertTriangle
      color = "text-red-600"
    } else if (porcentaje > 5) {
      status = "warning"
      label = "Aceptable"
      icon = AlertTriangle
      color = "text-yellow-600"
    } else if (porcentaje > 2) {
      status = "good"
      label = "Bueno"
      // color remains green
    }

    return {
      diferencia: diferencia.toFixed(2),
      porcentaje: porcentaje.toFixed(1),
      status,
      label,
      icon,
      color,
      isPositive: diferencia > 0
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando detalles del pesaje...</div>
      </div>
    )
  }

  if (error || !pesaje) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push("/pesaje")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const wasteType = getWasteTypeInfo(pesaje.residuo.tipo)
  const diferenciaInfo = getDiferenciaInfo()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/pesaje")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            Pesaje {pesaje.codigo_escaneado}
          </h1>
          <p className="text-muted-foreground">
            Registrado el {format(new Date(pesaje.fecha_hora), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
          </p>
        </div>
        {currentUser && ["supervisor", "admin"].includes(currentUser.rol) && (
          <Button variant="outline" onClick={() => router.push(`/pesaje/${pesaje.id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Real</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pesaje.peso} kg</div>
            <p className="text-xs text-muted-foreground">Peso registrado en báscula</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Estimado</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pesaje.residuo.cantidad} kg</div>
            <p className="text-xs text-muted-foreground">Peso inicial estimado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diferencia</CardTitle>
            {diferenciaInfo?.isPositive ? (
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${diferenciaInfo?.color}`}>
              {diferenciaInfo?.isPositive ? "+" : ""}{diferenciaInfo?.diferencia} kg
            </div>
            <p className="text-xs text-muted-foreground">
              {diferenciaInfo?.porcentaje}% de variación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisión</CardTitle>
            {diferenciaInfo && <diferenciaInfo.icon className={`h-4 w-4 ${diferenciaInfo.color}`} />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${diferenciaInfo?.color}`}>
              {diferenciaInfo?.label}
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluación de precisión
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for high differences */}
      {diferenciaInfo?.status === "danger" && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            La diferencia de peso es superior al 10%. Se recomienda revisar la calibración de la báscula 
            y verificar la clasificación inicial del residuo.
          </AlertDescription>
        </Alert>
      )}

      {/* Information Cards */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Información del Pesaje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Información del Pesaje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Peso Real</Label>
                <p className="font-semibold text-lg">{pesaje.peso} kg</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Código QR</Label>
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                  <code className="text-sm font-mono">{pesaje.codigo_escaneado}</code>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Fecha y Hora</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {format(new Date(pesaje.fecha_hora), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            </div>

            {pesaje.observaciones && (
              <div>
                <Label className="text-sm text-muted-foreground">Observaciones</Label>
                <p className="text-sm bg-muted p-3 rounded-lg mt-1">{pesaje.observaciones}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Responsable del Pesaje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Responsable del Pesaje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pesaje.responsable ? (
              <>
                <div>
                  <Label className="text-sm text-muted-foreground">Nombre</Label>
                  <p className="font-medium">{pesaje.responsable.nombre_completo}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Departamento</Label>
                  <p className="font-medium">{pesaje.responsable.departamento || "No especificado"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{pesaje.responsable.email}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground italic">Información del responsable no disponible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Información del Residuo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Información del Residuo
          </CardTitle>
          <CardDescription>
            Detalles del residuo que fue pesado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Tipo de Residuo</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-3 w-3 rounded-full bg-${wasteType.color}-500`} />
                  <Badge variant="outline" className="font-medium">
                    {wasteType.label}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Peso Estimado Original</Label>
                <p className="font-semibold text-lg">{pesaje.residuo.cantidad} kg</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Ubicación</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{pesaje.residuo.ubicacion}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Estado Actual</Label>
                <Badge variant="default" className="mt-1">
                  {pesaje.residuo.estado.charAt(0).toUpperCase() + pesaje.residuo.estado.slice(1)}
                </Badge>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Fecha de Generación</Label>
                <p className="font-medium">
                  {format(new Date(pesaje.residuo.fecha_generacion), "dd/MM/yyyy HH:mm", { locale: es })}
                </p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Generado por</Label>
                {pesaje.residuo.usuario ? (
                  <div>
                    <p className="font-medium">{pesaje.residuo.usuario.nombre_completo}</p>
                    {pesaje.residuo.usuario.departamento && (
                      <p className="text-sm text-muted-foreground">{pesaje.residuo.usuario.departamento}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Usuario no disponible</p>
                )}
              </div>
            </div>
          </div>

          {/* Análisis de Diferencia */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-3">Análisis de Diferencia</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="text-sm text-muted-foreground">Diferencia Absoluta</Label>
                <p className={`font-semibold ${diferenciaInfo?.color}`}>
                  {diferenciaInfo?.isPositive ? "+" : ""}{diferenciaInfo?.diferencia} kg
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Porcentaje de Variación</Label>
                <p className={`font-semibold ${diferenciaInfo?.color}`}>
                  {diferenciaInfo?.porcentaje}%
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Evaluación</Label>
                <div className="flex items-center gap-2">
                  {diferenciaInfo && <diferenciaInfo.icon className={`h-4 w-4 ${diferenciaInfo.color}`} />}
                  <Badge variant="outline" className={diferenciaInfo?.color}>
                    {diferenciaInfo?.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
