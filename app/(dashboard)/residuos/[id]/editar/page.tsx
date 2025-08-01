"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/hooks/use-language"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { WASTE_TYPES } from "@/lib/constants"

const wasteTypes = WASTE_TYPES.map(type => ({
  value: type.value,
  label: type.label,
  labelKey: `${type.value}`,
}));

export default function EditarResiduoPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { id } = params;

  // Simulación de carga de datos del residuo
  const [form, setForm] = useState({
    tipo: "biologico",
    cantidad: "",
    ubicacion: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResiduo = async () => {
      const { data, error } = await supabase
        .from("residuos")
        .select("*")
        .eq("id", id)
        .single()
      if (data) {
        setForm({
          tipo: data.tipo,
          cantidad: String(data.cantidad),
          ubicacion: data.ubicacion,
        })
      }
    }
    fetchResiduo()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const user = await getCurrentUser()
    const { error } = await supabase
      .from("residuos")
      .update({
        tipo: form.tipo,
        cantidad: Number.parseFloat(form.cantidad),
        ubicacion: form.ubicacion,
        // updated_at: new Date().toISOString(),
      })
      .eq("id", id)
    setLoading(false)
    if (!error) {
      alert(t("Residuo actualizado correctamente!"))
      router.push("/residuos")
    } else {
      console.error("Error al actualizar residuo:", error)
      alert("Error al actualizar residuo")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("Editar Residuo")}</h1>

      {/* Detalle del residuo actual */}
      <div className="mb-6 p-4 bg-gray-50 border rounded">
        <h2 className="text-lg font-semibold mb-2">{t("Detalle actual")}</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">{t("Tipo")}:</span> {t(form.tipo)}
          </div>
          <div>
            <span className="font-medium">{t("Cantidad (kg)")}:</span> {form.cantidad}
          </div>
          <div>
            <span className="font-medium">{t("Ubicación")}:</span> {form.ubicacion}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="tipo">{t("Tipo")}</Label>
          <select
            id="tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2"
            required
          >
            {wasteTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {t(type.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="cantidad">{t("Cantidad (kg)")}</Label>
          <Input id="cantidad" name="cantidad" type="number" min="0" value={form.cantidad} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="ubicacion">{t("Ubicación")}</Label>
          <Input id="ubicacion" name="ubicacion" value={form.ubicacion} onChange={handleChange} required />
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