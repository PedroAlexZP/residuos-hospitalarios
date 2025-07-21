"use client"

import { useState, useEffect } from "react"
import QRCode from "qrcode"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/hooks/use-language"
import { supabase } from "@/lib/supabase"

const etiquetaTypes = [
  { value: "QR", labelKey: "Código QR" },
  { value: "codigo_barras", labelKey: "Código de Barras" },
]


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
  const [errors, setErrors] = useState<{ tipo_etiqueta?: string; codigo_qr?: string }>({});

  useEffect(() => {
    const fetchEtiqueta = async () => {
      const { data } = await supabase
        .from("etiquetas")
        .select("tipo_etiqueta, codigo_qr")
        .eq("id", id)
        .single()
      if (data) {
        setForm({
          tipo_etiqueta: data.tipo_etiqueta,
          codigo_qr: data.codigo_qr,
        })
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
      router.push("/etiquetas")
    } else {
      alert("Error al actualizar etiqueta")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("Editar Etiqueta")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="tipo_etiqueta">{t("Tipo de Etiqueta")}</Label>
          <select
            id="tipo_etiqueta"
            name="tipo_etiqueta"
            value={form.tipo_etiqueta}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2"
            required
          >
            {etiquetaTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {t(type.labelKey)}
              </option>
            ))}
          </select>
          {errors.tipo_etiqueta && <div className="text-red-500 text-sm mt-1">{errors.tipo_etiqueta}</div>}
        </div>
        <div>
          <Label htmlFor="codigo_qr">{t("Código QR")}</Label>
          <Input id="codigo_qr" name="codigo_qr" value={form.codigo_qr} onChange={handleChange} required readOnly />
          {errors.codigo_qr && <div className="text-red-500 text-sm mt-1">{errors.codigo_qr}</div>}
        </div>
        <div className="flex gap-2 mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? t("Guardando...") : t("Guardar cambios")}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("Cancelar")}
          </Button>
        </div>
      </form>
    </div>
  );
} 