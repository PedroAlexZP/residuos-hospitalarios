"use client"

import { useState, useEffect } from "react"
import QRCode from "qrcode"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, QrCode, Tag, Calendar, MapPin, Scale, User, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/hooks/use-language"
import { supabase } from "@/lib/supabase"
import { WASTE_TYPES } from "@/lib/constants"
import Image from "next/image"

const etiquetaTypes = [
  { value: "QR", labelKey: "Código QR" },
  { value: "codigo_barras", labelKey: "Código de Barras" },
]

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

export default function EditarEtiquetaPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { id } = params;

  const [form, setForm] = useState({
    tipo_etiqueta: "QR",
    codigo_qr: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<{ tipo_etiqueta?: string; codigo_qr?: string }>({});
  const [etiquetaData, setEtiquetaData] = useState<EtiquetaData | null>(null);
  const [previewQrUrl, setPreviewQrUrl] = useState<string>("");

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
        setForm({
          tipo_etiqueta: data.tipo_etiqueta,
          codigo_qr: data.codigo_qr,
        });

        // Generate preview QR code
        if (data.codigo_qr) {
          const qrUrl = await QRCode.toDataURL(data.codigo_qr, {
            width: 200,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
          setPreviewQrUrl(qrUrl);
        }
      } catch (error) {
        console.error("Error fetching etiqueta:", error);
      } finally {
        setLoadingData(false);
      }
    }
    fetchEtiqueta()
  }, [id])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let newForm = { ...form, [name]: value }
    // Si cambia el tipo de etiqueta, genera un nuevo código QR único
    if (name === "tipo_etiqueta") {
      const timestamp = Date.now()
      const newCode = `${value}-${id}-${timestamp}`
      const qrData = JSON.stringify({ id, tipo_etiqueta: value, codigo: newCode })
      await QRCode.toDataURL(qrData)
      newForm = { ...newForm, codigo_qr: newCode }
    }
    setForm(newForm)
    setErrors((prev) => ({ ...prev, [name]: undefined }))

    // Update preview
    if (newForm.codigo_qr) {
      try {
        const qrUrl = await QRCode.toDataURL(newForm.codigo_qr, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setPreviewQrUrl(qrUrl);
      } catch (error) {
        console.error("Error generating preview:", error);
      }
    }
  }

  const handleSelectChange = async (value: string) => {
    let newForm = { ...form, tipo_etiqueta: value }
    // Si cambia el tipo de etiqueta, genera un nuevo código QR único
    const timestamp = Date.now()
    const newCode = `${value}-${id}-${timestamp}`
    const qrData = JSON.stringify({ id, tipo_etiqueta: value, codigo: newCode })
    await QRCode.toDataURL(qrData)
    newForm = { ...newForm, codigo_qr: newCode }
    setForm(newForm)
    setErrors((prev) => ({ ...prev, tipo_etiqueta: undefined }))

    // Update preview
    try {
      const qrUrl = await QRCode.toDataURL(newForm.codigo_qr, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setPreviewQrUrl(qrUrl);
    } catch (error) {
      console.error("Error generating preview:", error);
    }
  }

  const validateForm = () => {
    const newErrors: { tipo_etiqueta?: string; codigo_qr?: string } = {}
    if (!form.tipo_etiqueta || !["QR", "codigo_barras"].includes(form.tipo_etiqueta)) {
      newErrors.tipo_etiqueta = "Selecciona un tipo de etiqueta válido."
    }
    if (!form.codigo_qr || form.codigo_qr.length < 8) {
      newErrors.codigo_qr = "El código QR es obligatorio y debe ser válido."
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    // Generar código QR único antes de guardar
    const timestamp = Date.now()
    const newCode = `${form.tipo_etiqueta}-${id}-${timestamp}`
    const qrData = JSON.stringify({ id, tipo_etiqueta: form.tipo_etiqueta, codigo: newCode })
    await QRCode.toDataURL(qrData) // Solo para asegurar formato, no se guarda la imagen
    const { error } = await supabase
      .from("etiquetas")
      .update({
        tipo_etiqueta: form.tipo_etiqueta,
        codigo_qr: newCode,
      })
      .eq("id", id)
    setLoading(false)
    if (!error) {
      alert(t("Etiqueta actualizada correctamente!"))
      router.push(`/etiquetas/${id}`)
    } else {
      alert("Error al actualizar etiqueta")
    }
  }

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
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudo cargar la información de la etiqueta.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Editar Etiqueta")}</h1>
          <p className="text-muted-foreground">Modifica la información de la etiqueta</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Información Actual */}
        <div className="space-y-6">
          {/* Detalle Actual de la Etiqueta */}
          <Card>
            <CardHeader>
              <CardTitle>Información Actual</CardTitle>
              <CardDescription>
                Información actual de la etiqueta antes de editar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Tag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Código actual</p>
                    <p className="font-mono font-semibold">{etiquetaData.codigo_qr}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <QrCode className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo actual</p>
                    <Badge variant={etiquetaData.tipo_etiqueta === "QR" ? "default" : "secondary"}>
                      {etiquetaData.tipo_etiqueta === "QR" ? "Código QR" : "Código de Barras"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de creación</p>
                    <p className="font-semibold">{formatFecha(etiquetaData.fecha_creacion)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Residuo */}
          {etiquetaData.residuos && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Residuo Asociado
                  <div className="flex gap-2">
                    <Badge className={getTipoColor(etiquetaData.residuos.tipo)}>
                      {getWasteTypeInfo(etiquetaData.residuos.tipo).label}
                    </Badge>
                    <Badge className={getEstadoColor(etiquetaData.residuos.estado)}>
                      {etiquetaData.residuos.estado}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Scale className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cantidad</p>
                      <p className="font-semibold">{etiquetaData.residuos.cantidad} kg</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ubicación</p>
                      <p className="font-semibold">{etiquetaData.residuos.ubicacion}</p>
                    </div>
                  </div>
                  
                  {etiquetaData.residuos.users && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Usuario responsable</p>
                        <p className="font-semibold">{etiquetaData.residuos.users.nombre_completo}</p>
                        {etiquetaData.residuos.users.departamento && (
                          <p className="text-sm text-muted-foreground">{etiquetaData.residuos.users.departamento}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Formulario de Edición */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar Etiqueta</CardTitle>
              <CardDescription>
                Modifica el tipo de etiqueta (se generará un nuevo código automáticamente)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="tipo_etiqueta">{t("Tipo de Etiqueta")}</Label>
                  <Select value={form.tipo_etiqueta} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {etiquetaTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {t(type.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipo_etiqueta && <div className="text-red-500 text-sm mt-1">{errors.tipo_etiqueta}</div>}
                </div>

                <div>
                  <Label htmlFor="codigo_qr">{t("Código QR")}</Label>
                  <Input id="codigo_qr" name="codigo_qr" value={form.codigo_qr} onChange={handleChange} required readOnly />
                  <p className="text-sm text-muted-foreground mt-1">
                    El código se genera automáticamente al cambiar el tipo de etiqueta
                  </p>
                  {errors.codigo_qr && <div className="text-red-500 text-sm mt-1">{errors.codigo_qr}</div>}
                </div>

                <div className="flex gap-2 mt-6">
                  <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        {t("Guardando...")}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {t("Guardar cambios")}
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    {t("Cancelar")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Vista Previa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Vista Previa
              </CardTitle>
              <CardDescription>
                Previsualización del nuevo código generado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                {previewQrUrl ? (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                        <Image 
                          src={previewQrUrl} 
                          alt="QR Code Preview" 
                          width={200} 
                          height={200} 
                          className="mx-auto"
                        />
                      </div>
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">{form.codigo_qr}</p>
                    <Badge variant={form.tipo_etiqueta === "QR" ? "default" : "secondary"}>
                      {form.tipo_etiqueta === "QR" ? "Código QR" : "Código de Barras"}
                    </Badge>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Generando vista previa...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 