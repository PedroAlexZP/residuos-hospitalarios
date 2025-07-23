"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Scale, User, QrCode, Tag, Printer, Download, Eye } from "lucide-react"
import QRCodeLib from "qrcode"
import Image from "next/image"
import { WASTE_TYPES } from "@/lib/constants"

interface Etiqueta {
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

export default function EtiquetaDetallePage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  const [etiqueta, setEtiqueta] = useState<Etiqueta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    async function fetchEtiqueta() {
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
          .single();

        if (error) {
          setError(error.message);
          return;
        }

        setEtiqueta(data);

        // Generate QR code image
        if (data?.codigo_qr) {
          try {
            const qrUrl = await QRCodeLib.toDataURL(data.codigo_qr, {
              width: 300,
              margin: 2,
              color: {
                dark: "#000000",
                light: "#FFFFFF",
              },
            });
            setQrCodeUrl(qrUrl);
          } catch (qrError) {
            console.error("Error generating QR code:", qrError);
          }
        }
      } catch (err) {
        setError("Error al cargar la etiqueta");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEtiqueta();
    }
  }, [id]);

  const handleEdit = () => {
    router.push(`/etiquetas/${id}/editar`);
  };

  const handleDelete = async () => {
    if (!etiqueta) return;
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar esta etiqueta? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        const { error } = await supabase
          .from("etiquetas")
          .delete()
          .eq("id", id);

        if (error) throw error;

        // Navigate back to etiquetas list
        router.push("/etiquetas");
      } catch (err) {
        console.error("Error al eliminar etiqueta:", err);
        alert("Error al eliminar la etiqueta. Inténtalo de nuevo.");
      }
    }
  };

  const handlePrint = () => {
    if (qrCodeUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Etiqueta ${etiqueta?.codigo_qr}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  margin: 20px;
                }
                .label { 
                  border: 2px solid #000; 
                  padding: 20px; 
                  display: inline-block;
                  max-width: 400px;
                }
                .qr-code { 
                  margin: 10px 0; 
                }
                .info { 
                  margin: 5px 0; 
                  font-size: 12px;
                }
                .code { 
                  font-family: monospace; 
                  font-weight: bold; 
                  margin: 10px 0;
                }
              </style>
            </head>
            <body>
              <div class="label">
                <h3>Etiqueta de Residuo Hospitalario</h3>
                <div class="qr-code">
                  <img src="${qrCodeUrl}" alt="QR Code" />
                </div>
                <div class="code">${etiqueta?.codigo_qr}</div>
                <div class="info">Tipo: ${etiqueta?.residuos?.tipo}</div>
                <div class="info">Cantidad: ${etiqueta?.residuos?.cantidad} kg</div>
                <div class="info">Ubicación: ${etiqueta?.residuos?.ubicacion}</div>
                <div class="info">Fecha: ${new Date().toLocaleDateString()}</div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();

        // Mark as printed
        supabase
          .from("etiquetas")
          .update({ impresa: true })
          .eq("id", id)
          .then(() => {
            setEtiqueta(prev => prev ? { ...prev, impresa: true } : null);
          });
      }
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `etiqueta-${etiqueta?.codigo_qr}.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'generado':
        return 'bg-blue-100 text-blue-800'
      case 'etiquetado':
        return 'bg-green-100 text-green-800'
      case 'pesado':
        return 'bg-yellow-100 text-yellow-800'
      case 'almacenado':
        return 'bg-purple-100 text-purple-800'
      case 'entregado':
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

  const getWasteTypeInfo = (tipo: string) => {
    return WASTE_TYPES.find((w) => w.value === tipo) || { label: tipo, color: "gray" };
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalle de la Etiqueta</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>
      </div>
      
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Cargando información de la etiqueta...
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <h3 className="font-semibold mb-2">Error al cargar la etiqueta</h3>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!loading && !error && !etiqueta && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-yellow-800">
              <h3 className="font-semibold mb-2">Etiqueta no encontrada</h3>
              <p>No se pudo encontrar la etiqueta con el ID especificado.</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!loading && !error && etiqueta && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Información de la Etiqueta */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Información de la Etiqueta
                  <div className="flex gap-2">
                    <Badge variant={etiqueta.tipo_etiqueta === "QR" ? "default" : "secondary"}>
                      {etiqueta.tipo_etiqueta === "QR" ? "Código QR" : "Código de Barras"}
                    </Badge>
                    <Badge className={etiqueta.impresa ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {etiqueta.impresa ? "Impresa" : "Pendiente"}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Tag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Código</p>
                      <p className="font-mono font-semibold">{etiqueta.codigo_qr}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de creación</p>
                      <p className="font-semibold">{formatFecha(etiqueta.fecha_creacion)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Residuo */}
            {etiqueta.residuos && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Residuo Asociado
                    <div className="flex gap-2">
                      <Badge className={getTipoColor(etiqueta.residuos.tipo)}>
                        {getWasteTypeInfo(etiqueta.residuos.tipo).label}
                      </Badge>
                      <Badge className={getEstadoColor(etiqueta.residuos.estado)}>
                        {etiqueta.residuos.estado}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => router.push(`/residuos/${etiqueta.residuos?.id}`)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Ver detalle completo del residuo
                    </Button>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Scale className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cantidad</p>
                        <p className="font-semibold">{etiqueta.residuos.cantidad} kg</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ubicación</p>
                        <p className="font-semibold">{etiqueta.residuos.ubicacion}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha de generación</p>
                        <p className="font-semibold">{formatFecha(etiqueta.residuos.fecha_generacion)}</p>
                      </div>
                    </div>
                    
                    {etiqueta.residuos.users && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Usuario responsable</p>
                          <p className="font-semibold">{etiqueta.residuos.users.nombre_completo}</p>
                          {etiqueta.residuos.users.departamento && (
                            <p className="text-sm text-muted-foreground">{etiqueta.residuos.users.departamento}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acciones */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
                <CardDescription>
                  Gestiona esta etiqueta editando su información o eliminándola del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleEdit} disabled={loading || !etiqueta} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Editar Etiqueta
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete} 
                    disabled={loading || !etiqueta}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar Etiqueta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vista Previa y Herramientas */}
          <div className="space-y-6">
            {/* QR Code Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Vista Previa
                </CardTitle>
                <CardDescription>
                  Previsualización de la etiqueta generada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  {qrCodeUrl ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                          <Image 
                            src={qrCodeUrl} 
                            alt="QR Code" 
                            width={300} 
                            height={300} 
                            className="mx-auto"
                          />
                        </div>
                      </div>
                      <p className="font-mono text-sm text-muted-foreground">{etiqueta.codigo_qr}</p>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Generando código QR...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Herramientas */}
            <Card>
              <CardHeader>
                <CardTitle>Herramientas</CardTitle>
                <CardDescription>
                  Imprime o descarga la etiqueta para uso físico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={handlePrint}
                    disabled={!qrCodeUrl}
                    className="w-full flex items-center gap-2"
                    variant="outline"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir Etiqueta
                  </Button>
                  
                  <Button
                    onClick={handleDownload}
                    disabled={!qrCodeUrl}
                    className="w-full flex items-center gap-2"
                    variant="outline"
                  >
                    <Download className="h-4 w-4" />
                    Descargar Imagen
                  </Button>
                </div>
                
                {etiqueta.impresa && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ Esta etiqueta ya ha sido impresa
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información de Trazabilidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID de Etiqueta:</span>
                  <span className="font-mono">{etiqueta.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID de Residuo:</span>
                  <span className="font-mono">{etiqueta.residuo_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de Código:</span>
                  <span>{etiqueta.tipo_etiqueta === "QR" ? "Código QR" : "Código de Barras"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado de Impresión:</span>
                  <span>{etiqueta.impresa ? "Impresa" : "No impresa"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 