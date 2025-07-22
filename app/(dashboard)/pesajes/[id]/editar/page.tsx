"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function EditarPesajePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [form, setForm] = useState({
    residuo_id: "",
    peso: "",
    responsable_id: "",
    codigo_escaneado: "",
    observaciones: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPesaje = async () => {
      const { data } = await supabase
        .from("pesajes")
        .select("residuo_id, peso, responsable_id, codigo_escaneado, observaciones")
        .eq("id", id)
        .single()
      if (data) {
        setForm({
          residuo_id: data.residuo_id,
          peso: String(data.peso),
          responsable_id: data.responsable_id,
          codigo_escaneado: data.codigo_escaneado,
          observaciones: data.observaciones || "",
        })
      }
    }
    fetchPesaje()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from("pesajes")
      .update({
        residuo_id: form.residuo_id,
        peso: Number(form.peso),
        responsable_id: form.responsable_id,
        codigo_escaneado: form.codigo_escaneado,
        observaciones: form.observaciones,
      })
      .eq("id", id)
    setLoading(false)
    if (!error) {
      alert("Pesaje actualizado correctamente!")
      router.push("/pesajes")
    } else {
      alert("Error al actualizar pesaje")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Pesaje</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="residuo_id">ID Residuo</Label>
          <Input id="residuo_id" name="residuo_id" value={form.residuo_id} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="peso">Peso (kg)</Label>
          <Input id="peso" name="peso" type="number" min="0" step="0.01" value={form.peso} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="responsable_id">ID Responsable</Label>
          <Input id="responsable_id" name="responsable_id" value={form.responsable_id} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="codigo_escaneado">Código Escaneado</Label>
          <Input id="codigo_escaneado" name="codigo_escaneado" value={form.codigo_escaneado} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="observaciones">Observaciones</Label>
          <Input id="observaciones" name="observaciones" value={form.observaciones} onChange={handleChange} />
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
