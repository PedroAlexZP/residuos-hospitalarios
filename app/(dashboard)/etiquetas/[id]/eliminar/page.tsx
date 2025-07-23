"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Trash2, AlertTriangle, Tag, QrCode, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { WASTE_TYPES } from "@/lib/constants"

interface EtiquetaData {
  id: string
  codigo_qr: string
  tipo_etiqueta: string
  fecha_creacion: string
  impresa: boolean
  residuo_id: string
  residuos?: {
    id: string
    tipo: string
    cantidad: number
    ubicacion: string
    fecha_generacion: string
    estado: string
    users?: {
      nombre_completo: string
      departamento: string
    }
  }
}

export default function EliminarEtiquetaPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [etiquetaData, setEtiquetaData] = useState<EtiquetaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchEtiqueta = async () => {
      try {
        const { data, error } = await supabase
          .from("etiquetas")
          .select(`
            *,
            residuos (
              id,
              tipo,
              cantidad,
              ubicacion,
              fecha_generacion,
              estado,
              users (
                nombre_completo,
                departamento
              )
            )
          `)
          .eq("id", id)
          .single()

        if (error) throw error;
        setEtiquetaData(data);
      } catch (error) {
        console.error("Error fetching etiqueta:", error);
      } finally {
        setLoadingData(false);
      }
    }

    if (id) {
      fetchEtiqueta();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!etiquetaData) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("etiquetas")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Navigate back to etiquetas list
      router.push("/etiquetas");
    } catch (error) {
      console.error("Error deleting etiqueta:", error);
      alert("Error al eliminar la etiqueta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
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

  const getWasteTypeInfo = (tipo: string) => {
    return WASTE_TYPES.find((w) => w.value === tipo) || { label: tipo, color: "gray" };
  };

  if (loadingData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Cargando información de la etiqueta...
        </div>
      </div>
    );
  }

  if (!etiquetaData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No se pudo cargar la información de la etiqueta.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-red-600">Eliminar Etiqueta</h1>
          <p className="text-muted-foreground">Esta acción no se puede deshacer</p>
        </div>
      </div>

      {/* Warning Alert */}
      <Alert className="mb-6 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>¡Advertencia!</strong> Estás a punto de eliminar permanentemente esta etiqueta. 
          Esta acción no se puede deshacer y afectará la trazabilidad del residuo asociado.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Información de la Etiqueta */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Etiqueta a Eliminar
            </CardTitle>
            <CardDescription>
              Información de la etiqueta que será eliminada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Tag className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-mono font-semibold">{etiquetaData.codigo_qr}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <QrCode className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <Badge variant={etiquetaData.tipo_etiqueta === "QR" ? "default" : "secondary"}>
                    {etiquetaData.tipo_etiqueta === "QR" ? "Código QR" : "Código de Barras"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de creación</p>
                  <p className="font-semibold">{formatFecha(etiquetaData.fecha_creacion)}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Estado de impresión:</span>
                  <Badge className={etiquetaData.impresa ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {etiquetaData.impresa ? "Impresa" : "No impresa"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Residuo */}
        {etiquetaData.residuos && (
          <Card>
            <CardHeader>
              <CardTitle>Residuo Asociado</CardTitle>
              <CardDescription>
                Esta etiqueta está asociada al siguiente residuo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tipo de residuo:</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {getWasteTypeInfo(etiquetaData.residuos.tipo).label}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cantidad:</span>
                  <span className="font-semibold">{etiquetaData.residuos.cantidad} kg</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ubicación:</span>
                  <span className="font-semibold">{etiquetaData.residuos.ubicacion}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado actual:</span>
                  <Badge className="bg-gray-100 text-gray-800">
                    {etiquetaData.residuos.estado}
                  </Badge>
                </div>
                
                {etiquetaData.residuos.users && (
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">Usuario responsable:</div>
                    <div className="font-semibold">{etiquetaData.residuos.users.nombre_completo}</div>
                    {etiquetaData.residuos.users.departamento && (
                      <div className="text-sm text-muted-foreground">{etiquetaData.residuos.users.departamento}</div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <Card className="mt-6 border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-red-800">
              <h3 className="text-lg font-semibold mb-2">¿Confirmar eliminación?</h3>
              <p className="text-sm">
                ¿Estás seguro que deseas eliminar la etiqueta con código{" "}
                <span className="font-mono font-bold">{etiquetaData.codigo_qr}</span>?
              </p>
              <p className="text-sm mt-2">
                Esta acción eliminará permanentemente la etiqueta y afectará la trazabilidad del residuo asociado.
              </p>
            </div>
            
            <div className="flex justify-center gap-4 pt-4">
              <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Sí, eliminar etiqueta
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 