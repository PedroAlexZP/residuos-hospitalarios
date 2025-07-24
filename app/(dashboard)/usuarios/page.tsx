"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Search, 
  Edit, 
  Filter,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Truck,
  Building
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useToast } from "@/hooks/use-toast"

interface Usuario {
  id: string
  nombre_completo: string
  email: string
  rol: "generador" | "supervisor" | "transportista" | "gestor_externo" | "admin"
  departamento: string | null
  activo: boolean
  created_at: string
}

const rolesConfig = {
  admin: { label: "Administrador", icon: Crown, color: "bg-purple-100 text-purple-800 border-purple-300" },
  supervisor: { label: "Supervisor", icon: Shield, color: "bg-blue-100 text-blue-800 border-blue-300" },
  gestor_externo: { label: "Gestor Externo", icon: Building, color: "bg-green-100 text-green-800 border-green-300" },
  transportista: { label: "Transportista", icon: Truck, color: "bg-orange-100 text-orange-800 border-orange-300" },
  generador: { label: "Generador", icon: UserCheck, color: "bg-gray-100 text-gray-800 border-gray-300" }
}

export default function UsuariosPage() {
  const { toast } = useToast()
  const { user: currentUser, loading: userLoading } = useCurrentUser()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRol, setFilterRol] = useState("todos")
  const [filterEstado, setFilterEstado] = useState("todos")

  useEffect(() => {
    if (!userLoading && currentUser) {
      loadData()
    }
  }, [userLoading, currentUser])

  const loadData = async () => {
    if (!currentUser) return
    
    try {
      setLoading(true)
      await fetchUsuarios()
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsuarios = async () => {
    if (!currentUser) return

    try {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_all_users_public')
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        setUsuarios(rpcData)
        return
      }

      // Try direct query
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (!error && data) {
        setUsuarios(data)
        return
      }
      
      throw new Error("All queries failed")
      
    } catch (error) {
      console.error("💥 Error:", error)
      toast({
        title: "Error al cargar usuarios",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
      setUsuarios([])
    }
  }

  const toggleEstadoUsuario = async (usuarioId: string, nuevoEstado: boolean) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ activo: nuevoEstado })
        .eq("id", usuarioId)

      if (error) throw error

      setUsuarios(usuarios.map((u: Usuario) => 
        u.id === usuarioId ? { ...u, activo: nuevoEstado } : u
      ))

      toast({
        title: nuevoEstado ? "Usuario activado" : "Usuario desactivado",
        description: `El usuario ha sido ${nuevoEstado ? "activado" : "desactivado"} exitosamente`,
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del usuario",
        variant: "destructive",
      })
    }
  }

  // Optimized filtering with useMemo
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario: Usuario) => {
      const matchesSearch = usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (usuario.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      
      const matchesRol = filterRol === "todos" || usuario.rol === filterRol
      const matchesEstado = filterEstado === "todos" || 
                           (filterEstado === "activo" && usuario.activo) ||
                           (filterEstado === "inactivo" && !usuario.activo)

      return matchesSearch && matchesRol && matchesEstado
    })
  }, [usuarios, searchTerm, filterRol, filterEstado])

  // Optimized stats calculation with useMemo
  const stats = useMemo(() => ({
    total: usuarios.length,
    activos: usuarios.filter((u: Usuario) => u.activo).length,
    porRol: Object.keys(rolesConfig).reduce((acc, rol) => {
      acc[rol] = usuarios.filter((u: Usuario) => u.rol === rol).length
      return acc
    }, {} as Record<string, number>)
  }), [usuarios])

  // Optimized helper functions with useMemo
  const getRolIcon = useMemo(() => (rol: string) => {
    const config = rolesConfig[rol as keyof typeof rolesConfig]
    return config?.icon || UserCheck
  }, [])

  const getRolColor = useMemo(() => (rol: string) => {
    const config = rolesConfig[rol as keyof typeof rolesConfig]
    return config?.color || "bg-gray-100 text-gray-800 border-gray-300"
  }, [])

  const getRolLabel = useMemo(() => (rol: string) => {
    const config = rolesConfig[rol as keyof typeof rolesConfig]
    return config?.label || rol
  }, [])

  // Early return for loading state
  if (userLoading || loading) {
    const skeletonCards = Array.from({ length: 4 }, (_, i) => `card-${Date.now()}-${i}`)
    const skeletonRows = Array.from({ length: 5 }, (_, i) => `row-${Date.now()}-${i}`)
    
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {skeletonCards.map((key) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skeletonRows.map((key) => (
                <div key={key} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500">Registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Usuarios Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
            <p className="text-xs text-gray-500">
              {stats.total > 0 ? `${Math.round((stats.activos / stats.total) * 100)}% del total` : "0% del total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Administradores</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.porRol.admin || 0}</div>
            <p className="text-xs text-gray-500">Con acceso completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Supervisores</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.porRol.supervisor || 0}</div>
            <p className="text-xs text-gray-500">Gestión operativa</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email o departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="lg:w-48">
              <Select value={filterRol} onValueChange={setFilterRol}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  {Object.entries(rolesConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:w-48">
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Solo activos</SelectItem>
                  <SelectItem value="inactivo">Solo inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Users className="h-8 w-8" />
                        <p>No se encontraron usuarios</p>
                        <p className="text-sm">
                          {usuarios.length === 0 
                            ? "No hay usuarios registrados en el sistema"
                            : "Prueba con otros filtros de búsqueda"
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => {
                    const RolIcon = getRolIcon(usuario.rol)
                    return (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {usuario.nombre_completo
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {usuario.nombre_completo}
                              </div>
                              <div className="text-sm text-gray-500">
                                {usuario.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getRolColor(usuario.rol)}
                          >
                            <RolIcon className="mr-1 h-3 w-3" />
                            {getRolLabel(usuario.rol)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">
                            {usuario.departamento || "Sin asignar"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={usuario.activo ? "default" : "secondary"}
                            className={usuario.activo 
                              ? "bg-green-100 text-green-800 border-green-300" 
                              : "bg-red-100 text-red-800 border-red-300"
                            }
                          >
                            {usuario.activo ? (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            ) : (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {usuario.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {new Date(usuario.created_at).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleEstadoUsuario(usuario.id, !usuario.activo)}
                            >
                              {usuario.activo ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
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
