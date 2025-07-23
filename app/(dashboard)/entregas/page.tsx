"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Search,
  Truck,
  FileText,
  Eye,
  MoreHorizontal,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useLanguage } from "@/hooks/use-language"

interface Entrega {
  id: string
  fecha_hora: string
  certificado_pdf: string | null
  estado: string
  numero_seguimiento: string | null
  usuario: {
    nombre_completo: string
    departamento: string
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
      ubicacion: string
    }
  }[]
}

export default function EntregasPage() {
  const [user, setUser] = useState<User | null>(null)
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const { t } = useLanguage()

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        if (currentUser) {
          await loadEntregas(currentUser)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadEntregas = async (user: User) => {
    try {
      let query = supabase
        .from("entregas")
        .select(`
          *,
          usuario:users(nombre_completo, departamento),
          gestor_externo:gestores_externos(id, nombre, licencia, contacto),
          entrega_residuos(
            residuo:residuos(id, tipo, cantidad, ubicacion)
          )
        `)
        .order("fecha_hora", { ascending: false })

      // Filtrar por rol
      if (user.rol === "gestor_externo") {
        // Aquí necesitaríamos una relación entre usuarios y gestores externos
        // Por ahora mostramos todas las entregas para gestores externos
      } else if (!["supervisor", "admin"].includes(user.rol)) {
        query = query.eq("usuario_id", user.id)
      }

      const { data, error } = await query

      if (error) throw error
      setEntregas(data || [])
    } catch (error) {
      console.error("Error loading entregas:", error)
    }
  }

  const getEstadoBadge = (estado: string): { variant: "default" | "destructive" | "outline" | "secondary"; color: string } => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      pendiente: "secondary",
      confirmada: "default",
      tratada: "outline",
    }
    const colors = {
      pendiente: "text-yellow-700 bg-yellow-50 border-yellow-200",
      confirmada: "text-blue-700 bg-blue-50 border-blue-200",
      tratada: "text-green-700 bg-green-50 border-green-200",
    }
    return {
      variant: variants[estado] ?? "secondary",
      color: colors[estado as keyof typeof colors],
    }
  }

  const filteredEntregas = entregas.filter((entrega) => {
    const matchesSearch =
      entrega.gestor_externo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrega.numero_seguimiento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrega.usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = filterEstado === "all" || entrega.estado === filterEstado

    return matchesSearch && matchesEstado
  })

  // Calcular estadísticas
  const totalResiduos = entregas.reduce((sum, e) => sum + e.entrega_residuos.length, 0)
  const pesoTotal = entregas.reduce(
    (sum, e) => sum + e.entrega_residuos.reduce((subSum, er) => subSum + er.residuo.cantidad, 0),
    0,
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted animate-pulse rounded w-48" />
          <div className="h-10 bg-muted animate-pulse rounded w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("gestionEntregas")}</h1>
          <p className="text-muted-foreground">{t("entregasGestoresExternos")}</p>
        </div>
        {user && ["supervisor", "transportista", "admin"].includes(user.rol) && (
          <Link href="/entregas/nueva">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("nuevaEntrega")}
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalEntregas")}</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entregas.length}</div>
            <p className="text-xs text-muted-foreground">{totalResiduos} residuos entregados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("pendientes")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entregas.filter((e) => e.estado === "pendiente").length}</div>
            <p className="text-xs text-muted-foreground">Requieren confirmación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entregas.filter((e) => e.estado === "confirmada").length}</div>
            <p className="text-xs text-muted-foreground">En proceso de tratamiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pesoTotal.toFixed(2)} kg</div>
            <p className="text-xs text-muted-foreground">Residuos procesados</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending deliveries */}
      {entregas.filter((e) => e.estado === "pendiente").length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Hay {entregas.filter((e) => e.estado === "pendiente").length} entrega(s) pendiente(s) de confirmación por
            parte de los gestores externos.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por gestor, número de seguimiento o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="tratada">Tratada</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || filterEstado !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterEstado("all")
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Entregas Registradas</CardTitle>
          <CardDescription>
            {filteredEntregas.length} de {entregas.length} entregas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Gestor Externo</TableHead>
                  <TableHead>Residuos</TableHead>
                  <TableHead>Peso Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Certificado</TableHead>
                  <TableHead className="w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntregas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No se encontraron entregas.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntregas.map((entrega) => {
                    const estadoBadge = getEstadoBadge(entrega.estado)
                    const pesoTotalEntrega = entrega.entrega_residuos.reduce((sum, er) => sum + er.residuo.cantidad, 0)

                    return (
                      <TableRow key={entrega.id}>
                        <TableCell>
                          <code className="text-sm font-mono">
                            {entrega.numero_seguimiento || `ENT-${entrega.id.slice(-8)}`}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{entrega.gestor_externo.nombre}</div>
                            <div className="text-sm text-muted-foreground">Lic: {entrega.gestor_externo.licencia}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="mb-1">
                              {entrega.entrega_residuos.length} residuo(s)
                            </Badge>
                            <div className="space-y-1">
                              {entrega.entrega_residuos.slice(0, 3).map((er, index) => (
                                <div key={index} className="text-xs text-muted-foreground">
                                  <span className="font-medium">
                                    {er.residuo.tipo.charAt(0).toUpperCase() + er.residuo.tipo.slice(1)}:
                                  </span>{" "}
                                  {er.residuo.cantidad}kg - {er.residuo.ubicacion}
                                </div>
                              ))}
                              {entrega.entrega_residuos.length > 3 && (
                                <div className="text-xs text-muted-foreground italic">
                                  +{entrega.entrega_residuos.length - 3} más...
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{pesoTotalEntrega.toFixed(2)} kg</TableCell>
                        <TableCell>
                          <Badge variant={estadoBadge.variant}>
                            {entrega.estado.charAt(0).toUpperCase() + entrega.estado.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{entrega.usuario.nombre_completo}</div>
                            {entrega.usuario.departamento && (
                              <div className="text-sm text-muted-foreground">{entrega.usuario.departamento}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(entrega.fecha_hora), "dd/MM/yyyy HH:mm", { locale: es })}
                        </TableCell>
                        <TableCell>
                          {entrega.certificado_pdf ? (
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Badge variant="secondary">Pendiente</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/entregas/${entrega.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalles
                                </Link>
                              </DropdownMenuItem>
                              {entrega.certificado_pdf && (
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Descargar certificado
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
