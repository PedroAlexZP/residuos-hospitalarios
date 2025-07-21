"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function EditarEntregaResiduoPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [form, setForm] = useState({
    entrega_id: "",
    residuo_id: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ entrega_id?: string; residuo_id?: string }>({})

  useEffect(() => {
    const fetchEntregaResiduo = async () => {
      const { data } = await supabase
        .from("entrega_residuos")
        .select("entrega_id, residuo_id")
        .eq("id", id)
        .single()
      if (data) {
        setForm({
          entrega_id: data.entrega_id,
          residuo_id: data.residuo_id,
        })
      }
    }
    fetchEntregaResiduo()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const validateForm = () => {
    const newErrors: { entrega_id?: string; residuo_id?: string } = {}
    if (!form.entrega_id || form.entrega_id.length < 8) newErrors.entrega_id = "El ID de entrega es obligatorio y debe ser válido."
    if (!form.residuo_id || form.residuo_id.length < 8) newErrors.residuo_id = "El ID de residuo es obligatorio y debe ser válido."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const { error } = await supabase
      .from("entrega_residuos")
      .update({
        entrega_id: form.entrega_id,
        residuo_id: form.residuo_id,
      })
      .eq("id", id)
    setLoading(false)
    if (!error) {
      alert("Relación actualizada correctamente!")
      router.push("/entrega-residuos")
    } else {
      alert("Error al actualizar relación")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Relación Entrega-Residuo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="entrega_id">ID Entrega</Label>
          <Input id="entrega_id" name="entrega_id" value={form.entrega_id} onChange={handleChange} required />
          {errors.entrega_id && <div className="text-red-500 text-sm mt-1">{errors.entrega_id}</div>}
        </div>
        <div>
          <Label htmlFor="residuo_id">ID Residuo</Label>
          <Input id="residuo_id" name="residuo_id" value={form.residuo_id} onChange={handleChange} required />
          {errors.residuo_id && <div className="text-red-500 text-sm mt-1">{errors.residuo_id}</div>}
        </div>
        <div className="flex gap-2 mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
