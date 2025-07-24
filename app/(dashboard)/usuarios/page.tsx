"use client"

import { useEffect, useState } from "react"
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
  UserPlus, 
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
import { getCurrentUser, type User as AuthUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface Usuario {
  id: string
  nombre_completo: string
  email: string
  rol: "generador" | "supervisor" | "transportista" | "gestor_externo" | "admin"
  departamento: string | null
  activo: boolean
  created_at: string
  auth_user_id: string
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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRol, setFilterRol] = useState<string>("todos")
  const [filterEstado, setFilterEstado] = useState<string>("todos")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
      
      if (!user || !["admin", "supervisor"].includes(user.rol)) {
        toast({
          title: "Sin permisos",
          description: "No tiene permisos para ver la lista de usuarios",
          variant: "destructive",
        })
        return
      }

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
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error("Error fetching usuarios:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de usuarios",
        variant: "destructive",
      })
    }
  }

  const toggleEstadoUsuario = async (usuarioId: string, nuevoEstado: boolean) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ activo: nuevoEstado })
        .eq("id", usuarioId)

      if (error) throw error

      setUsuarios(usuarios.map(u => 
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

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (usuario.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesRol = filterRol === "todos" || usuario.rol === filterRol
    const matchesEstado = filterEstado === "todos" || 
                         (filterEstado === "activo" && usuario.activo) ||
                         (filterEstado === "inactivo" && !usuario.activo)

    return matchesSearch && matchesRol && matchesEstado
  })

  const getEstadisticas = () => {
    const total = usuarios.length
    const activos = usuarios.filter(u => u.activo).length
    const inactivos = total - activos
    const porRol = Object.keys(rolesConfig).reduce((acc, rol) => {
      acc[rol] = usuarios.filter(u => u.rol === rol).length
      return acc
    }, {} as Record<string, number>)

    return { total, activos, inactivos, porRol }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-8 bg-muted animate-pulse rounded w-64" />
            <div className="h-4 bg-muted animate-pulse rounded w-80" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!currentUser || !["admin", "supervisor"].includes(currentUser.rol)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <UserX className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Sin permisos</h2>
          <p className="text-muted-foreground">No tiene permisos para ver la gestión de usuarios</p>
        </div>
      </div>
    )
  }

  const stats = getEstadisticas()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground">
            Administrar usuarios del sistema de residuos hospitalarios
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.activos / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Inactivos</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactivos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.inactivos / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.porRol.admin || 0}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios con rol admin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                {Object.entries(rolesConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="activo">Solo activos</SelectItem>
                <SelectItem value="inactivo">Solo inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuarios
          </CardTitle>
          <CardDescription>
            {filteredUsuarios.length} usuario{filteredUsuarios.length !== 1 ? 's' : ''} 
            {searchTerm || filterRol !== "todos" || filterEstado !== "todos" ? ' (filtrados)' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsuarios.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Registro</TableHead>
                    {currentUser.rol === "admin" && <TableHead>Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.map((usuario) => {
                    const rolConfig = rolesConfig[usuario.rol]
                    const IconoRol = rolConfig.icon
                    
                    return (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {usuario.nombre_completo.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{usuario.nombre_completo}</p>
                              <p className="text-sm text-muted-foreground">{usuario.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={rolConfig.color}>
                            <IconoRol className="h-3 w-3 mr-1" />
                            {rolConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {usuario.departamento || "No asignado"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={usuario.activo ? "default" : "secondary"}>
                            {usuario.activo ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Activo
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactivo
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(usuario.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>

                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron usuarios</h3>
              <p>
                {searchTerm || filterRol !== "todos" || filterEstado !== "todos"
                  ? "No hay usuarios que coincidan con los filtros aplicados"
                  : "No hay usuarios registrados en el sistema"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 