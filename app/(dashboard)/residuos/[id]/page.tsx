"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Scale, User } from "lucide-react"

interface Residuo {
  id: string
  tipo: string
  cantidad: number
  ubicacion: string
  fecha_generacion: string
  estado: string
  usuario_id: string
  users?: {
    nombre_completo: string
    departamento: string
  }
}

export default function ResiduoDetallePage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  const [residuo, setResiduo] = useState<Residuo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResiduo() {
      const { data, error } = await supabase
        .from("residuos")
        .select("*")
        .eq("id", id)
        .single();
      if (error) setError(error.message);
      setResiduo(data);
      setLoading(false);
    }
    fetchResiduo();
  }, [id]);

  const handleEdit = () => {
    router.push(`/residuos/${id}/editar`);
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar este residuo?")) return;
    const { error } = await supabase
      .from("residuos")
      .delete()
      .eq("id", id);
    if (!error) {
      alert("Residuo eliminado correctamente");
      router.push("/residuos");
    } else {
      alert("Error al eliminar residuo");
    }
  };


  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'generado':
        return 'bg-blue-100 text-blue-800'
      case 'etiquetado':
        return 'bg-green-100 text-green-800'
      case 'recolectado':
        return 'bg-yellow-100 text-yellow-800'
      case 'eliminado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'biologico':
        return 'bg-red-100 text-red-800'
      case 'quimico':
        return 'bg-orange-100 text-orange-800'
      case 'punzocortante':
        return 'bg-purple-100 text-purple-800'
      case 'farmaceutico':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalle del Residuo</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>
      </div>
      
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Cargando información del residuo...
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <h3 className="font-semibold mb-2">Error al cargar el residuo</h3>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!loading && !error && !residuo && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-yellow-800">
              <h3 className="font-semibold mb-2">Residuo no encontrado</h3>
              <p>No se pudo encontrar el residuo con el ID especificado.</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!loading && !error && residuo && (
        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Información del Residuo
                <div className="flex gap-2">
                  <Badge className={getTipoColor(residuo.tipo)}>
                    {residuo.tipo}
                  </Badge>
                  <Badge className={getEstadoColor(residuo.estado)}>
                    {residuo.estado}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Scale className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cantidad</p>
                    <p className="font-semibold">{residuo.cantidad} kg</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-semibold">{residuo.ubicacion}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de generación</p>
                    <p className="font-semibold">{formatFecha(residuo.fecha_generacion)}</p>
                  </div>
                </div>
                
                {residuo.users && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <User className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Usuario responsable</p>
                      <p className="font-semibold">{residuo.users.nombre_completo}</p>
                      {residuo.users.departamento && (
                        <p className="text-sm text-muted-foreground">{residuo.users.departamento}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>
                Gestiona este residuo editando su información o eliminándolo del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button onClick={handleEdit} disabled={loading || !residuo} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Editar Residuo
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete} 
                  disabled={loading || !residuo}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar Residuo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 