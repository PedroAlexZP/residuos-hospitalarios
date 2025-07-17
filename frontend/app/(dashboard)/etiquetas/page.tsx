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
import { Plus, Search, QrCode, Printer, Download, MoreHorizontal, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { WASTE_TYPES } from "@/lib/constants"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useLanguage } from "@/hooks/use-language"

interface Etiqueta {
  id: string
  codigo_qr: string
  tipo_etiqueta: string
  fecha_creacion: string
  impresa: boolean
  residuo: {
    id: string
    tipo: string
    cantidad: number
    ubicacion: string
    usuario: {
      nombre_completo: string
      departamento: string
    }
  }
}

export default function EtiquetasPage() {
  const [user, setUser] = useState<User | null>(null)
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("all")
  const { t } = useLanguage()

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        if (currentUser) {
          await loadEtiquetas(currentUser)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadEtiquetas = async (user: User) => {
    try {
      const query = supabase
        .from("etiquetas")
        .select(`
          *,
          residuo:residuos(
            id,
            tipo,
            cantidad,
            ubicacion,
            usuario:users(nombre_completo, departamento)
          )
        `)
        .order("fecha_creacion", { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setEtiquetas(data || [])
    } catch (error) {
      console.error("Error loading etiquetas:", error)
    }
  }

  const getWasteTypeInfo = (tipo: string) => {
    return WASTE_TYPES.find((w) => w.value === tipo) || { label: tipo, color: "gray" }
  }

  const filteredEtiquetas = etiquetas.filter((etiqueta) => {
    const matchesSearch =
      etiqueta.codigo_qr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etiqueta.residuo.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etiqueta.residuo.usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = filterTipo === "all" || etiqueta.tipo_etiqueta === filterTipo

    return matchesSearch && matchesTipo
  })

  const handlePrint = (etiquetaId: string) => {
    // Implementar lógica de impresión
    console.log("Printing etiqueta:", etiquetaId)
  }

  const handleDownload = (etiquetaId: string) => {
    // Implementar lógica de descarga
    console.log("Downloading etiqueta:", etiquetaId)
  }

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
          <h1 className="text-3xl font-bold tracking-tight">{t("gestionEtiquetas")}</h1>
          <p className="text-muted-foreground">{t("registroSeguimientoEtiquetas")}</p>
        </div>
        {user && ["generador", "supervisor", "admin"].includes(user.rol) && (
          <Link href="/etiquetas/generar">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("generarEtiqueta")}
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalEtiquetas")}</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{etiquetas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Códigos QR</CardTitle>
            <div className="h-2 w-2 bg-blue-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{etiquetas.filter((e) => e.tipo_etiqueta === "QR").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Códigos de Barras</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {etiquetas.filter((e) => e.tipo_etiqueta === "codigo_barras").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impresas</CardTitle>
            <Printer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{etiquetas.filter((e) => e.impresa).length}</div>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Buscar por código, ubicación o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo de etiqueta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="QR">Código QR</SelectItem>
                <SelectItem value="codigo_barras">Código de Barras</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || filterTipo !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterTipo("all")
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
          <CardTitle>Etiquetas Generadas</CardTitle>
          <CardDescription>
            {filteredEtiquetas.length} de {etiquetas.length} etiquetas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Residuo</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEtiquetas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No se encontraron etiquetas.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEtiquetas.map((etiqueta) => {
                    const wasteType = getWasteTypeInfo(etiqueta.residuo.tipo)
                    return (
                      <TableRow key={etiqueta.id}>
                        <TableCell className="font-mono text-sm">{etiqueta.codigo_qr}</TableCell>
                        <TableCell>
                          <Badge variant={etiqueta.tipo_etiqueta === "QR" ? "default" : "secondary"}>
                            {etiqueta.tipo_etiqueta === "QR" ? "QR" : "Código de Barras"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="font-medium">
                              {wasteType.label}
                            </Badge>
                            <div className="text-sm text-muted-foreground">{etiqueta.residuo.cantidad} kg</div>
                          </div>
                        </TableCell>
                        <TableCell>{etiqueta.residuo.ubicacion}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{etiqueta.residuo.usuario.nombre_completo}</div>
                            {etiqueta.residuo.usuario.departamento && (
                              <div className="text-sm text-muted-foreground">
                                {etiqueta.residuo.usuario.departamento}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={etiqueta.impresa ? "default" : "secondary"}>
                            {etiqueta.impresa ? "Impresa" : "Pendiente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(etiqueta.fecha_creacion), "dd/MM/yyyy HH:mm", { locale: es })}
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
                                <Link href={`/etiquetas/${etiqueta.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("verDetalles")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrint(etiqueta.id)}>
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(etiqueta.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                Descargar
                              </DropdownMenuItem>
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
