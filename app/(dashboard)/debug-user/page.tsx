"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

// Componente para la información del usuario
const UserInfoCard = ({ currentUser, updating, onUpdateToAdmin, onUpdateProfile, onLoadUserData, onRefreshSession, onForceReload, onLoadPermisos, loadingPermisos }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Datos Actuales</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-medium text-muted-foreground">ID</span>
          <p className="font-mono text-sm">{currentUser.id}</p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-muted-foreground">Email</span>
          <p>{currentUser.email}</p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-muted-foreground">Nombre Completo</span>
          <p>{currentUser.nombre_completo || <span className="text-red-500">Sin nombre</span>}</p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-muted-foreground">Departamento</span>
          <p>{currentUser.departamento || <span className="text-red-500">Sin departamento</span>}</p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-muted-foreground">Rol Actual</span>
          <div>
            <Badge 
              variant={currentUser.rol === 'admin' ? 'default' : 'secondary'}
              className={currentUser.rol === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
            >
              {currentUser.rol}
            </Badge>
          </div>
        </div>
        
        <div>
          <span className="text-sm font-medium text-muted-foreground">Estado</span>
          <div>
            <Badge variant={currentUser.activo ? 'default' : 'secondary'}>
              {currentUser.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t space-y-3">
        <h3 className="font-medium">Acciones Rápidas</h3>
        
        <div className="flex flex-wrap gap-3">
          {currentUser.rol !== 'admin' && (
            <Button 
              onClick={onUpdateToAdmin} 
              disabled={updating}
              className="bg-green-600 hover:bg-green-700"
            >
              {updating ? 'Actualizando...' : 'Cambiar a Admin'}
            </Button>
          )}
          
          {(!currentUser.nombre_completo || !currentUser.departamento) && (
            <Button 
              onClick={onUpdateProfile} 
              disabled={updating}
              variant="outline"
            >
              {updating ? 'Actualizando...' : 'Completar Perfil'}
            </Button>
          )}
          
          <Button 
            onClick={onLoadUserData} 
            variant="outline"
            disabled={updating}
          >
            Recargar Datos
          </Button>
          
          <Button 
            onClick={onRefreshSession} 
            variant="outline"
            disabled={updating}
            className="bg-yellow-50 hover:bg-yellow-100"
          >
            {updating ? 'Refrescando...' : 'Refrescar Sesión'}
          </Button>
          
          <Button 
            onClick={onForceReload} 
            variant="outline"
            disabled={updating}
            className="bg-red-50 hover:bg-red-100"
          >
            Recargar Página Completa
          </Button>
          
          <Button 
            onClick={() => onLoadPermisos('admin')} 
            variant="outline"
            disabled={loadingPermisos}
            className="bg-blue-50 hover:bg-blue-100"
          >
            {loadingPermisos ? 'Cargando...' : 'Ver Permisos Admin'}
          </Button>
          
          <Button 
            onClick={() => onLoadPermisos(currentUser?.rol)} 
            variant="outline"
            disabled={loadingPermisos}
            className="bg-purple-50 hover:bg-purple-100"
          >
            {loadingPermisos ? 'Cargando...' : 'Ver Mis Permisos'}
          </Button>
          
          <Button 
            onClick={() => onLoadPermisos('all')} 
            variant="outline"
            disabled={loadingPermisos}
            className="bg-orange-50 hover:bg-orange-100"
          >
            {loadingPermisos ? 'Cargando...' : 'Ver Todos los Roles'}
          </Button>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <h3 className="font-medium mb-2">JSON Completo</h3>
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
          {JSON.stringify(currentUser, null, 2)}
        </pre>
      </div>
    </CardContent>
  </Card>
)

// Componente para la tabla de permisos
const PermissionsTable = ({ permisos }: any) => {
  const getRoleClassName = (rol: string): string => {
    switch (rol) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'supervisor':
        return 'bg-blue-100 text-blue-800'
      case 'generador':
        return 'bg-green-100 text-green-800'
      case 'transportista':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Permisos del Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Rol</th>
                <th className="text-left p-2 font-medium">Módulo</th>
                <th className="text-center p-2 font-medium">Lectura</th>
                <th className="text-center p-2 font-medium">Escritura</th>
                <th className="text-center p-2 font-medium">Eliminación</th>
              </tr>
            </thead>
            <tbody>
              {permisos.map((permiso: any, index: number) => (
                <tr key={permiso.id || index} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <Badge 
                      variant={permiso.rol === 'admin' ? 'default' : 'secondary'}
                      className={getRoleClassName(permiso.rol)}
                    >
                      {permiso.rol}
                    </Badge>
                  </td>
                  <td className="p-2 font-medium">{permiso.modulo}</td>
                  <td className="p-2 text-center">
                    <span className={`inline-block w-4 h-4 rounded-full ${permiso.lectura ? 'bg-green-500' : 'bg-red-500'}`}>
                      {permiso.lectura ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`inline-block w-4 h-4 rounded-full ${permiso.escritura ? 'bg-green-500' : 'bg-red-500'}`}>
                      {permiso.escritura ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`inline-block w-4 h-4 rounded-full ${permiso.eliminacion ? 'bg-green-500' : 'bg-red-500'}`}>
                      {permiso.eliminacion ? '✓' : '✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Leyenda de Permisos</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              <span>✓ = Permitido</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
              <span>✗ = Denegado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">ADMIN = Acceso Total</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DebugUserPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [permisos, setPermisos] = useState<any[]>([])
  const [loadingPermisos, setLoadingPermisos] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPermisos = async (rol?: string) => {
    setLoadingPermisos(true)
    try {
      if (rol === 'all') {
        const { data, error } = await supabase
          .from('permisos')
          .select('*')
          .order('rol', { ascending: true })
          .order('modulo', { ascending: true })

        if (error) throw error
        setPermisos(data || [])
      } else {
        const targetRol = rol || currentUser?.rol || 'admin'
        const { data, error } = await supabase
          .from('permisos')
          .select('*')
          .eq('rol', targetRol)
          .order('modulo')

        if (error) throw error
        setPermisos(data || [])
      }
    } catch (error) {
      console.error('Error loading permisos:', error)
      setPermisos([])
    } finally {
      setLoadingPermisos(false)
    }
  }

  const updateToAdmin = async () => {
    if (!currentUser) return
    
    setUpdating(true)
    try {
      // Verificar el rol actual en la base de datos
      const { data: currentData, error: checkError } = await supabase
        .from('users')
        .select('rol')
        .eq('id', currentUser.id)
        .single()

      if (checkError) throw checkError

      console.log('Rol actual en DB:', currentData.rol)

      if (currentData.rol === 'admin') {
        alert('El usuario ya es admin en la base de datos. El problema es de caché.')
        await refreshSession()
        return
      }

      // Actualizar rol a admin
      await updateUserRole('admin')
    } catch (error: any) {
      console.error('Error updating role:', error)
      alert('Error al actualizar el rol: ' + error.message)
    } finally {
      setUpdating(false)
    }
  }

  const updateUserRole = async (newRole: string) => {
    if (!currentUser) return

    const { error } = await supabase
      .from('users')
      .update({ rol: newRole })
      .eq('id', currentUser.id)

    if (error) throw error

    // Verificar que se actualizó
    const { data: updatedData, error: verifyError } = await supabase
      .from('users')
      .select('rol')
      .eq('id', currentUser.id)
      .single()

    if (verifyError) throw verifyError

    console.log('Rol después de actualizar:', updatedData.rol)
    alert(`Rol actualizado a ${newRole} correctamente. Nuevo rol: ${updatedData.rol}`)
    
    await loadUserData()
    await refreshSession()
  }

  const updateProfile = async () => {
    if (!currentUser) return
    
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          nombre_completo: 'Luis Esquel',
          departamento: 'Administración'
        })
        .eq('id', currentUser.id)

      if (error) throw error

      alert('Perfil actualizado correctamente')
      await loadUserData() // Recargar datos
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error al actualizar el perfil')
    } finally {
      setUpdating(false)
    }
  }

  const refreshSession = async () => {
    setUpdating(true)
    try {
      // Forzar refresco de la sesión de Supabase
      const { error } = await supabase.auth.getSession()
      if (error) throw error

      // Limpiar cualquier caché local
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user-cache')
        sessionStorage.clear()
      }

      // Recargar datos del usuario
      await loadUserData()
      
      alert('Sesión refrescada correctamente. Recarga la página completa con F5 si es necesario.')
    } catch (error) {
      console.error('Error refreshing session:', error)
      alert('Error al refrescar la sesión')
    } finally {
      setUpdating(false)
    }
  }

  const forceReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando información del usuario...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Información del Usuario</h1>
      
      {currentUser ? (
        <UserInfoCard
          currentUser={currentUser}
          updating={updating}
          onUpdateToAdmin={updateToAdmin}
          onUpdateProfile={updateProfile}
          onLoadUserData={loadUserData}
          onRefreshSession={refreshSession}
          onForceReload={forceReload}
          onLoadPermisos={loadPermisos}
          loadingPermisos={loadingPermisos}
        />
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500">No se pudo cargar la información del usuario</p>
          </CardContent>
        </Card>
      )}
      
      {/* Tabla de Permisos */}
      {permisos.length > 0 && <PermissionsTable permisos={permisos} />}
    </div>
  )
}
