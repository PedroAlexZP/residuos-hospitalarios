"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/hooks/use-language"

export default function EditarDepartamentoPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { id } = params;

  // Simulación de carga de datos del departamento
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simular fetch de datos
    setTimeout(() => {
      setForm({
        name: "Departamento de Prueba",
        description: "Descripción de ejemplo del departamento",
      });
    }, 500);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Aquí iría la lógica para actualizar el departamento en Supabase
    setTimeout(() => {
      setLoading(false);
      alert(t("Departamento actualizado correctamente!"));
      router.push("/departamentos");
    }, 1000);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("Editar Departamento")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">{t("Nombre")}</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="description">{t("Descripción")}</Label>
          <Input id="description" name="description" value={form.description} onChange={handleChange} required />
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