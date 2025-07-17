"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/hooks/use-language"

const etiquetaTypes = [
  { value: "QR", labelKey: "Código QR" },
  { value: "codigo_barras", labelKey: "Código de Barras" },
]

export default function EditarEtiquetaPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { id } = params;

  // Simulación de carga de datos de la etiqueta
  const [form, setForm] = useState({
    tipo_etiqueta: "QR",
    codigo: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simular fetch de datos
    setTimeout(() => {
      setForm({
        tipo_etiqueta: "codigo_barras",
        codigo: "ETQ-123456",
      });
    }, 500);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Aquí iría la lógica para actualizar la etiqueta en Supabase
    setTimeout(() => {
      setLoading(false);
      alert(t("Etiqueta actualizada correctamente!"));
      router.push("/etiquetas");
    }, 1000);
  };

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
        </div>
        <div>
          <Label htmlFor="codigo">{t("Código")}</Label>
          <Input id="codigo" name="codigo" value={form.codigo} onChange={handleChange} required />
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