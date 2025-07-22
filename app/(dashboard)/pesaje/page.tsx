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
import { Plus, Search, Scale, QrCode, Eye, MoreHorizontal, AlertTriangle, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type User } from "@/lib/auth"
import { WASTE_TYPES } from "@/lib/constants"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useLanguage } from "@/hooks/use-language"

interface Pesaje {
  id: string
  peso: number
  fecha_hora: string
  codigo_escaneado: string
  observaciones: string
  responsable: {
    nombre_completo: string
    departamento: string
  }
  residuo: {
    id: string
    tipo: string
    cantidad: number
    ubicacion: string
    usuario: {
      nombre_completo: string
    }
  }
}

export default function PesajePage() {
  const [user, setUser] = useState<User | null>(null)
  const [pesajes, setPesajes] = useState<Pesaje[]>([])
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
          await loadPesajes(currentUser)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadPesajes = async (user: User) => {
    try {
      let query = supabase
        .from("pesajes")
        .select(`
          *,
          responsable:users!pesajes_responsable_id_fkey(nombre_completo, departamento),
          residuo:residuos(
            id,
            tipo,
            cantidad,
            ubicacion,
            usuario:users(nombre_completo)
          )
        `)
        .order("fecha_hora", { ascending: false })

      // Filtrar por rol
      if (user.rol === "transportista") {
        query = query.eq("responsable_id", user.id)
      }

      const { data, error } = await query

      if (error) throw error
      setPesajes(data || [])
    } catch (error) {
      console.error("Error loading pesajes:", error)
    }
  }

  const getWasteTypeInfo = (tipo: string) => {
    return WASTE_TYPES.find((w) => w.value === tipo) || { label: tipo, color: "gray" }
  }

  const getDiferenciaBadge = (diferencia: number, cantidadOriginal: number) => {
    const porcentaje = Math.abs((diferencia / cantidadOriginal) * 100)
    if (porcentaje <= 5) return { variant: "default" as const, label: "Normal" }
    if (porcentaje <= 10) return { variant: "secondary" as const, label: "Aceptable" }
    return { variant: "destructive" as const, label: "Alta" }
  }

  const filteredPesajes = pesajes.filter((pesaje) => {
    const matchesSearch =
      pesaje.codigo_escaneado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pesaje.residuo.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pesaje.responsable.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = filterTipo === "all" || pesaje.residuo.tipo === filterTipo

    return matchesSearch && matchesTipo
  })

  // Calcular estadísticas
  const totalPeso = pesajes.reduce((sum, p) => sum + p.peso, 0)
  const pesoPromedio = pesajes.length > 0 ? totalPeso / pesajes.length : 0
  const diferenciasAltas = pesajes.filter((p) => {
    const diferencia = Math.abs(p.peso - p.residuo.cantidad)
    return (diferencia / p.residuo.cantidad) * 100 > 10
  }).length

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
          <h1 className="text-3xl font-bold tracking-tight">{t("gestionPesaje")}</h1>
          <p className="text-muted-foreground">{t("registroSeguimientoPesaje")}</p>
        </div>
        {user && ["supervisor", "transportista", "admin"].includes(user.rol) && (
          <Link href="/pesaje/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("nuevoPesaje")}
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalPesajes")}</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pesajes.length}</div>
            <p className="text-xs text-muted-foreground">
              +{pesajes.filter((p) => new Date(p.fecha_hora).toDateString() === new Date().toDateString()).length} hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPeso.toFixed(2)} kg</div>
            <p className="text-xs text-muted-foreground">Promedio: {pesoPromedio.toFixed(2)} kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diferencias Altas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diferenciasAltas}</div>
            <p className="text-xs text-muted-foreground">
              {pesajes.length > 0 ? ((diferenciasAltas / pesajes.length) * 100).toFixed(1) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisión</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pesajes.length > 0 ? (100 - (diferenciasAltas / pesajes.length) * 100).toFixed(1) : 100}%
            </div>
            <p className="text-xs text-muted-foreground">Pesajes dentro del rango</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for high differences */}
      {diferenciasAltas > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Hay {diferenciasAltas} pesaje(s) con diferencias superiores al 10%. Revisa la calibración de las básculas y
            la clasificación inicial de los residuos.
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
                  placeholder="Buscar por código, ubicación o responsable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo de residuo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {WASTE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
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
          <CardTitle>Registro de Pesajes</CardTitle>
          <CardDescription>
            {filteredPesajes.length} de {pesajes.length} pesajes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Residuo</TableHead>
                  <TableHead>Peso Real</TableHead>
                  <TableHead>Peso Estimado</TableHead>
                  <TableHead>Diferencia</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPesajes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No se encontraron pesajes.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPesajes.map((pesaje) => {
                    const wasteType = getWasteTypeInfo(pesaje.residuo.tipo)
                    const diferencia = pesaje.peso - pesaje.residuo.cantidad
                    const porcentajeDiferencia = ((Math.abs(diferencia) / pesaje.residuo.cantidad) * 100).toFixed(1)
                    const diferenciaBadge = getDiferenciaBadge(diferencia, pesaje.residuo.cantidad)

                    return (
                      <TableRow key={pesaje.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 text-muted-foreground" />
                            <code className="text-sm font-mono">{pesaje.codigo_escaneado}</code>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="font-medium">
                              {wasteType.label}
                            </Badge>
                            <div className="text-sm text-muted-foreground">{pesaje.residuo.ubicacion}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{pesaje.peso.toFixed(2)} kg</TableCell>
                        <TableCell className="text-muted-foreground">{pesaje.residuo.cantidad.toFixed(2)} kg</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={diferencia >= 0 ? "text-orange-600" : "text-blue-600"}>
                                {diferencia >= 0 ? "+" : ""}
                                {diferencia.toFixed(2)} kg
                              </span>
                              <Badge variant={diferenciaBadge.variant} className="text-xs">
                                {porcentajeDiferencia}%
                              </Badge>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {diferenciaBadge.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{pesaje.responsable.nombre_completo}</div>
                            {pesaje.responsable.departamento && (
                              <div className="text-sm text-muted-foreground">{pesaje.responsable.departamento}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(pesaje.fecha_hora), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
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
                                <Link href={`/pesaje/${pesaje.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalles
                                </Link>
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
