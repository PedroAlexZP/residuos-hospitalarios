"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/hooks/use-language"

const estados = [
  { value: "abierta", labelKey: "Abierta" },
  { value: "en_progreso", labelKey: "En progreso" },
  { value: "cerrada", labelKey: "Cerrada" },
]

export default function EditarIncidenciaPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { id } = params;

  // Simulación de carga de datos de la incidencia
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    estado: "abierta",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simular fetch de datos
    setTimeout(() => {
      setForm({
        titulo: "Incidencia de ejemplo",
        descripcion: "Descripción de la incidencia de ejemplo.",
        estado: "en_progreso",
      });
    }, 500);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Aquí iría la lógica para actualizar la incidencia en Supabase
    setTimeout(() => {
      setLoading(false);
      alert(t("Incidencia actualizada correctamente!"));
      router.push("/incidencias");
    }, 1000);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("Editar Incidencia")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="titulo">{t("Título")}</Label>
          <Input id="titulo" name="titulo" value={form.titulo} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="descripcion">{t("Descripción")}</Label>
          <Input id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="estado">{t("Estado")}</Label>
          <select
            id="estado"
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2"
            required
          >
            {estados.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {t(estado.labelKey)}
              </option>
            ))}
          </select>
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