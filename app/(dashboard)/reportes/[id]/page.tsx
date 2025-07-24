"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash2, Download, FileText, Calendar, UserIcon, Filter, Settings, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Reporte {
  id: string
  tipo: string
  descripcion: string
  fecha_generacion: string
  filtros_aplicados: {
    fecha_inicio?: string
    fecha_fin?: string
    departamentos?: string[]
    tipos_residuo?: string[]
    urgencias?: string[]
    estados?: string[]
    incluir_graficos?: boolean
    formato?: string
  }
  archivo_url?: string
  estado: string
  usuario_id: string
  usuario: {
    id: string
    nombre_completo: string
    email: string
    departamento: string
    rol: string
  }
}

const TIPOS_REPORTE = {
  residuos_generados: "Residuos Generados",
  cumplimiento_normativo: "Cumplimiento Normativo",
  entregas_externas: "Entregas Externas",
  incidencias: "Incidencias",
  capacitaciones: "Capacitaciones",
  inventario: "Inventario"
}

const ESTADO_COLORS = {
  generando: "bg-blue-100 text-blue-800",
  completado: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  pendiente: "bg-yellow-100 text-yellow-800"
}

export default function DetalleReportePage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [id])

  const loadUserData = async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, nombre_completo, email, departamento, rol")
        .eq("id", userId)
        .single()
      
      if (!userError && userData) {
        return userData
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
    
    return {
      id: userId,
      nombre_completo: "Usuario no encontrado",
      email: "N/A",
      departamento: "N/A",
      rol: "N/A"
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!id) {
        setError("ID de reporte no válido")
        return
      }

      // Cargar usuario actual
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (userError) {
        console.error("Error loading current user:", userError)
      }

      // Cargar reporte
      const { data: reporteData, error: reporteError } = await supabase
        .from("reportes")
        .select("*")
        .eq("id", id)
        .single()

      if (reporteError) {
        console.error("Error en consulta de reporte:", reporteError)
        const errorMessage = reporteError.code === 'PGRST116' 
          ? "Reporte no encontrado" 
          : `Error de base de datos: ${reporteError.message}`
        setError(errorMessage)
        return
      }

      if (!reporteData) {
        setError("Reporte no encontrado")
        return
      }

      // Cargar información del usuario
      const usuarioData = reporteData.usuario_id 
        ? await loadUserData(reporteData.usuario_id)
        : {
            id: '',
            nombre_completo: "Usuario no especificado",
            email: "N/A",
            departamento: "N/A",
            rol: "N/A"
          }

      // Combinar datos
      setReporte({
        ...reporteData,
        usuario: usuarioData
      })
    } catch (error) {
      console.error("Error loading reporte:", error)
      setError(`Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  const canEdit = () => {
    if (!currentUser || !reporte) return false
    return (
      currentUser.rol === "admin" ||
      currentUser.rol === "supervisor" ||
      currentUser.id === reporte.usuario_id
    )
  }

  const canDelete = () => {
    if (!currentUser || !reporte) return false
    return (
      currentUser.rol === "admin" ||
      currentUser.id === reporte.usuario_id
    )
  }

  const handleDownload = async () => {
    if (!reporte?.archivo_url) {
      alert("El archivo del reporte aún no está disponible")
      return
    }
    
    // Aquí implementarías la lógica de descarga
    window.open(reporte.archivo_url, '_blank')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando reporte...</div>
      </div>
    )
  }

  if (error || !reporte) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-muted-foreground mb-4">{error || "Reporte no encontrado"}</p>
              <Button onClick={() => router.push("/reportes")}>
                Volver a Reportes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/reportes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalle del Reporte</h1>
            <p className="text-muted-foreground">ID: {reporte.id.slice(0, 8)}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          {reporte.estado === "completado" && reporte.archivo_url && (
            <Button onClick={handleDownload} variant="default">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          )}
          {canEdit() && (
            <Button asChild variant="outline">
              <Link href={`/reportes/${id}/editar`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          )}
          {canDelete() && (
            <Button asChild variant="destructive">
              <Link href={`/reportes/${id}/eliminar`}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Tipo de Reporte</span>
                <p className="mt-1">{TIPOS_REPORTE[reporte.tipo as keyof typeof TIPOS_REPORTE] || reporte.tipo}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Fecha de Generación</span>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(reporte.fecha_generacion), "PPP 'a las' p", { locale: es })}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Estado</span>
                <div className="mt-1">
                  <Badge className={ESTADO_COLORS[reporte.estado as keyof typeof ESTADO_COLORS]}>
                    <Clock className="h-3 w-3 mr-1" />
                    {reporte.estado.charAt(0).toUpperCase() + reporte.estado.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Formato</span>
                <p className="mt-1">{reporte.filtros_aplicados?.formato?.toUpperCase() || "PDF"}</p>
              </div>
            </div>

            <Separator />

            <div>
              <span className="text-sm font-medium text-muted-foreground">Descripción</span>
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{reporte.descripcion}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usuario Solicitante */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Usuario Solicitante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Nombre Completo</span>
                <p className="mt-1">{reporte.usuario?.nombre_completo || "No disponible"}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Email</span>
                <p className="mt-1">{reporte.usuario?.email || "No disponible"}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Departamento</span>
                <p className="mt-1">{reporte.usuario?.departamento || "No disponible"}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Rol</span>
                <div className="mt-1">
                  <Badge variant="outline">
                    {reporte.usuario.rol.charAt(0).toUpperCase() + reporte.usuario.rol.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros Aplicados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Aplicados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reporte.filtros_aplicados?.fecha_inicio && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Fecha de Inicio</span>
                  <p className="mt-1">{format(new Date(reporte.filtros_aplicados.fecha_inicio), "PPP", { locale: es })}</p>
                </div>
              )}
              
              {reporte.filtros_aplicados?.fecha_fin && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Fecha de Fin</span>
                  <p className="mt-1">{format(new Date(reporte.filtros_aplicados.fecha_fin), "PPP", { locale: es })}</p>
                </div>
              )}
            </div>

            {reporte.filtros_aplicados?.departamentos && reporte.filtros_aplicados.departamentos.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Departamentos</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {reporte.filtros_aplicados.departamentos.map((dept) => (
                    <Badge key={dept} variant="secondary">{dept}</Badge>
                  ))}
                </div>
              </div>
            )}

            {reporte.filtros_aplicados?.tipos_residuo && reporte.filtros_aplicados.tipos_residuo.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Tipos de Residuo</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {reporte.filtros_aplicados.tipos_residuo.map((tipo) => (
                    <Badge key={tipo} variant="secondary">{tipo.replace('_', ' ')}</Badge>
                  ))}
                </div>
              </div>
            )}

            {reporte.filtros_aplicados?.urgencias && reporte.filtros_aplicados.urgencias.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Urgencias</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {reporte.filtros_aplicados.urgencias.map((urgencia) => (
                    <Badge key={urgencia} variant="secondary">{urgencia}</Badge>
                  ))}
                </div>
              </div>
            )}

            {reporte.filtros_aplicados?.estados && reporte.filtros_aplicados.estados.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Estados</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {reporte.filtros_aplicados.estados.map((estado) => (
                    <Badge key={estado} variant="secondary">{estado.replace('_', ' ')}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuración */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Incluir Gráficos</span>
                <p className="mt-1">{reporte.filtros_aplicados?.incluir_graficos ? "Sí" : "No"}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Formato de Archivo</span>
                <p className="mt-1">{reporte.filtros_aplicados?.formato?.toUpperCase() || "PDF"}</p>
              </div>
            </div>

            {reporte.archivo_url && (
              <div className="mt-4">
                <span className="text-sm font-medium text-muted-foreground">Archivo Generado</span>
                <div className="mt-2">
                  <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Reporte
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
