"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Truck,
  FileText,
  Package,
  User as UserIcon,
  Calendar,
  MapPin,
  Weight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface EntregaDetalle {
  id: string
  fecha_hora: string
  certificado_pdf: string | null
  estado: string
  numero_seguimiento: string | null
  usuario: {
    nombre_completo: string
    departamento: string
    email: string
  }
  gestor_externo: {
    id: string
    nombre: string
    licencia: string
    contacto: string
  }
  entrega_residuos: {
    residuo: {
      id: string
      tipo: string
      cantidad: number
      ubicacion: string | null
      fecha_generacion: string | null
      estado: string | null
      usuario: {
        nombre_completo: string
        departamento: string | null
      } | null
    }
  }[]
}

export default function EntregaDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [entrega, setEntrega] = useState<EntregaDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser && params.id) {
          await loadEntrega(params.id as string, currentUser)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Error al cargar los datos de la entrega")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  const loadEntrega = async (entregaId: string, currentUser: User) => {
    try {
      let query = supabase
        .from("entregas")
        .select(`
          *,
          usuario:users!entregas_usuario_id_fkey(nombre_completo, departamento, email),
          gestor_externo:gestores_externos!entregas_gestor_externo_id_fkey(id, nombre, licencia, contacto),
          entrega_residuos(
            residuo:residuos(
              id, tipo, cantidad, ubicacion, fecha_generacion, estado,
              usuario:users!residuos_usuario_id_fkey(nombre_completo, departamento)
            )
          )
        `)
        .eq("id", entregaId)

      // Filtrar por permisos de usuario
      if (!["supervisor", "admin"].includes(currentUser.rol)) {
        query = query.eq("usuario_id", currentUser.id)
      }

      const { data, error } = await query.single()

      if (error) {
        console.error("Error en consulta de entrega:", error)
        if (error.code === 'PGRST116') {
          setError("Entrega no encontrada o no tienes permisos para verla")
        } else {
          throw error
        }
        return
      }

      console.log("Datos de entrega obtenidos:", data)
      console.log("Residuos en entrega:", data?.entrega_residuos)
      
      // Verificar si hay residuos con usuarios nulos
      if (data?.entrega_residuos) {
        const residuosSinUsuario = data.entrega_residuos.filter((er: any) => !er.residuo.usuario)
        if (residuosSinUsuario.length > 0) {
          console.warn("Residuos sin usuario encontrados:", residuosSinUsuario.length)
        }
      }

      setEntrega(data)
    } catch (error) {
      console.error("Error loading entrega:", error)
      setError("Error al cargar los detalles de la entrega")
    }
  }

  const getEstadoBadge = (estado: string) => {
    const configs = {
      pendiente: { variant: "secondary" as const, color: "text-yellow-700 bg-yellow-50", icon: Clock },
      confirmada: { variant: "default" as const, color: "text-blue-700 bg-blue-50", icon: CheckCircle },
      tratada: { variant: "outline" as const, color: "text-green-700 bg-green-50", icon: CheckCircle },
    }
    return configs[estado as keyof typeof configs] || configs.pendiente
  }

  const getTipoResiduoColor = (tipo: string) => {
    const colors = {
      anatomopatologico: "bg-red-100 text-red-700",
      cortopunzante: "bg-orange-100 text-orange-700",
      farmaceutico: "bg-blue-100 text-blue-700",
      quimioterapico: "bg-purple-100 text-purple-700",
      radioactivo: "bg-yellow-100 text-yellow-700",
      infeccioso: "bg-pink-100 text-pink-700",
      patologico: "bg-gray-100 text-gray-700",
    }
    return colors[tipo as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando detalles de la entrega...</div>
      </div>
    )
  }

  if (error || !entrega) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push("/entregas")}>
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

  const estadoBadge = getEstadoBadge(entrega.estado)
  const pesoTotal = entrega.entrega_residuos.reduce((sum, er) => sum + er.residuo.cantidad, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/entregas")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            Entrega {entrega.numero_seguimiento || `ENT-${entrega.id.slice(-8)}`}
          </h1>
          <p className="text-muted-foreground">
            Detalle completo de la entrega a gestor externo
          </p>
        </div>
        <div className="ml-auto">
          <Badge variant={estadoBadge.variant} className="text-sm px-3 py-1">
            <estadoBadge.icon className="h-4 w-4 mr-1" />
            {entrega.estado.charAt(0).toUpperCase() + entrega.estado.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Residuos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entrega.entrega_residuos.length}</div>
            <p className="text-xs text-muted-foreground">Unidades entregadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pesoTotal.toFixed(2)} kg</div>
            <p className="text-xs text-muted-foreground">Peso total procesado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fecha</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(entrega.fecha_hora), "dd/MM", { locale: es })}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(entrega.fecha_hora), "yyyy 'a las' HH:mm", { locale: es })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificado</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {entrega.certificado_pdf ? (
              <div>
                <div className="text-2xl font-bold text-green-600">✓</div>
                <p className="text-xs text-muted-foreground">Disponible</p>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-yellow-600">⏳</div>
                <p className="text-xs text-muted-foreground">Pendiente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Entrega Information */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Gestor Externo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Gestor Externo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong>Nombre:</strong> {entrega.gestor_externo.nombre}
            </div>
            <div>
              <strong>Licencia:</strong> {entrega.gestor_externo.licencia}
            </div>
            <div>
              <strong>Contacto:</strong> {entrega.gestor_externo.contacto || 'No especificado'}
            </div>
          </CardContent>
        </Card>

        {/* Usuario Responsable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Usuario Responsable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong>Nombre:</strong> {entrega.usuario.nombre_completo}
            </div>
            <div>
              <strong>Departamento:</strong> {entrega.usuario.departamento || 'No especificado'}
            </div>
            <div>
              <strong>Email:</strong> {entrega.usuario.email}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Residuos Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Residuos Entregados ({entrega.entrega_residuos.length})
          </CardTitle>
          <CardDescription>
            Detalle de todos los residuos incluidos en esta entrega
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Generado por</TableHead>
                  <TableHead>Fecha Generación</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entrega.entrega_residuos.map((er) => (
                  <TableRow key={er.residuo.id}>
                    <TableCell>
                      <code className="text-sm font-mono">
                        {er.residuo.id.slice(-8)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTipoResiduoColor(er.residuo.tipo)}>
                        {er.residuo.tipo.charAt(0).toUpperCase() + er.residuo.tipo.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {er.residuo.cantidad} kg
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {er.residuo.ubicacion || "Ubicación no especificada"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {er.residuo.usuario ? (
                        <div className="space-y-1">
                          <div className="font-medium">
                            {er.residuo.usuario.nombre_completo}
                          </div>
                          {er.residuo.usuario.departamento && (
                            <div className="text-sm text-muted-foreground">
                              {er.residuo.usuario.departamento}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic">
                          Usuario no disponible
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {er.residuo.fecha_generacion ? 
                        format(new Date(er.residuo.fecha_generacion), "dd/MM/yyyy HH:mm", { locale: es }) :
                        "Fecha no disponible"
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {er.residuo.estado ? 
                          er.residuo.estado.charAt(0).toUpperCase() + er.residuo.estado.slice(1) : 
                          "Estado desconocido"
                        }
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {entrega.certificado_pdf && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Certificado de Tratamiento</CardTitle>
            <CardDescription>
              Documento oficial del tratamiento de los residuos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Descargar Certificado PDF
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
