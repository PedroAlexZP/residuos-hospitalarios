"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"


export default function NuevoPesajePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    residuo_id: "",
    peso: "",
    responsable_id: "",
    codigo_escaneado: "",
    observaciones: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    residuo_id?: string
    peso?: string
    responsable_id?: string
    codigo_escaneado?: string
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const validateForm = () => {
    const newErrors: {
      residuo_id?: string
      peso?: string
      responsable_id?: string
      codigo_escaneado?: string
    } = {}
    if (!form.residuo_id || form.residuo_id.length < 8) {
      newErrors.residuo_id = "El ID del residuo es obligatorio y debe ser válido."
    }
    if (!form.peso || isNaN(Number(form.peso)) || Number(form.peso) <= 0) {
      newErrors.peso = "El peso es obligatorio y debe ser mayor a 0."
    }
    if (!form.responsable_id || form.responsable_id.length < 8) {
      newErrors.responsable_id = "El ID del responsable es obligatorio y debe ser válido."
    }
    if (!form.codigo_escaneado || form.codigo_escaneado.length < 4) {
      newErrors.codigo_escaneado = "El código escaneado es obligatorio y debe ser válido."
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const { error } = await supabase
      .from("pesajes")
      .insert({
        residuo_id: form.residuo_id,
        peso: Number(form.peso),
        responsable_id: form.responsable_id,
        codigo_escaneado: form.codigo_escaneado,
        observaciones: form.observaciones,
      })
    setLoading(false)
    if (!error) {
      alert("Pesaje registrado correctamente!")
      router.push("/pesajes")
    } else {
      alert("Error al registrar pesaje")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nuevo Pesaje</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="residuo_id">ID Residuo</Label>
          <Input id="residuo_id" name="residuo_id" value={form.residuo_id} onChange={handleChange} required />
          {errors.residuo_id && <div className="text-red-500 text-sm mt-1">{errors.residuo_id}</div>}
        </div>
        <div>
          <Label htmlFor="peso">Peso (kg)</Label>
          <Input id="peso" name="peso" type="number" min="0" step="0.01" value={form.peso} onChange={handleChange} required />
          {errors.peso && <div className="text-red-500 text-sm mt-1">{errors.peso}</div>}
        </div>
        <div>
          <Label htmlFor="responsable_id">ID Responsable</Label>
          <Input id="responsable_id" name="responsable_id" value={form.responsable_id} onChange={handleChange} required />
          {errors.responsable_id && <div className="text-red-500 text-sm mt-1">{errors.responsable_id}</div>}
        </div>
        <div>
          <Label htmlFor="codigo_escaneado">Código Escaneado</Label>
          <Input id="codigo_escaneado" name="codigo_escaneado" value={form.codigo_escaneado} onChange={handleChange} required />
          {errors.codigo_escaneado && <div className="text-red-500 text-sm mt-1">{errors.codigo_escaneado}</div>}
        </div>
        <div>
          <Label htmlFor="observaciones">Observaciones</Label>
          <Input id="observaciones" name="observaciones" value={form.observaciones} onChange={handleChange} />
        </div>
        <div className="flex gap-2 mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Registrar"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
