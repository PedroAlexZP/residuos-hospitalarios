"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

const URGENCIAS = ["baja", "media", "alta", "critica"]
const ESTADOS = ["abierta", "en_proceso", "resuelta", "cerrada"]

export default function NuevaIncidenciaPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    tipo: "",
    descripcion: "",
    urgencia: "baja",
    residuo_id: "",
    usuario_id: "",
    estado: "abierta",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    tipo?: string
    descripcion?: string
    urgencia?: string
    usuario_id?: string
    estado?: string
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const validateForm = () => {
    const newErrors: {
      tipo?: string
      descripcion?: string
      urgencia?: string
      usuario_id?: string
      estado?: string
    } = {}
    if (!form.tipo || form.tipo.length < 3) newErrors.tipo = "El tipo es obligatorio."
    if (!form.descripcion || form.descripcion.length < 5) newErrors.descripcion = "La descripción es obligatoria."
    if (!URGENCIAS.includes(form.urgencia)) newErrors.urgencia = "Selecciona una urgencia válida."
    if (!form.usuario_id || form.usuario_id.length < 8) newErrors.usuario_id = "El ID de usuario es obligatorio y debe ser válido."
    if (!ESTADOS.includes(form.estado)) newErrors.estado = "Selecciona un estado válido."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const { error } = await supabase
      .from("incidencias")
      .insert({
        tipo: form.tipo,
        descripcion: form.descripcion,
        urgencia: form.urgencia,
        residuo_id: form.residuo_id,
        usuario_id: form.usuario_id,
        estado: form.estado,
      })
    setLoading(false)
    if (!error) {
      alert("Incidencia registrada correctamente!")
      router.push("/incidencias")
    } else {
      alert("Error al registrar incidencia")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nueva Incidencia</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Input id="tipo" name="tipo" value={form.tipo} onChange={handleChange} required />
          {errors.tipo && <div className="text-red-500 text-sm mt-1">{errors.tipo}</div>}
        </div>
        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Input id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} required />
          {errors.descripcion && <div className="text-red-500 text-sm mt-1">{errors.descripcion}</div>}
        </div>
        <div>
          <Label htmlFor="urgencia">Urgencia</Label>
          <select id="urgencia" name="urgencia" value={form.urgencia} onChange={handleChange} className="w-full border rounded px-2 py-2" required>
            {URGENCIAS.map((u) => (
              <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
            ))}
          </select>
          {errors.urgencia && <div className="text-red-500 text-sm mt-1">{errors.urgencia}</div>}
        </div>
        <div>
          <Label htmlFor="residuo_id">ID Residuo</Label>
          <Input id="residuo_id" name="residuo_id" value={form.residuo_id} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="usuario_id">ID Usuario</Label>
          <Input id="usuario_id" name="usuario_id" value={form.usuario_id} onChange={handleChange} required />
          {errors.usuario_id && <div className="text-red-500 text-sm mt-1">{errors.usuario_id}</div>}
        </div>
        <div>
          <Label htmlFor="estado">Estado</Label>
          <select id="estado" name="estado" value={form.estado} onChange={handleChange} className="w-full border rounded px-2 py-2" required>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1).replace('_', ' ')}</option>
            ))}
          </select>
          {errors.estado && <div className="text-red-500 text-sm mt-1">{errors.estado}</div>}
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
