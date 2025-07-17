"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/hooks/use-language"

const roles = [
  { value: "admin", labelKey: "admin" },
  { value: "supervisor", labelKey: "supervisor" },
  { value: "generador", labelKey: "generador" },
  { value: "transportista", labelKey: "transportista" },
  { value: "gestor_externo", labelKey: "gestor_externo" },
]

export default function EditarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { id } = params;

  // Simulación de carga de datos del usuario
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "generador",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simular fetch de datos
    setTimeout(() => {
      setForm({
        fullName: "John Doe",
        email: "john@example.com",
        role: "supervisor",
      });
    }, 500);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Aquí iría la lógica para actualizar el usuario en Supabase
    setTimeout(() => {
      setLoading(false);
      alert(t("Usuario actualizado correctamente!"));
      router.push("/usuarios");
    }, 1000);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("Editar Usuario")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">{t("Nombre completo")}</Label>
          <Input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="role">{t("Rol")}</Label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2"
            required
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {t(role.labelKey)}
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