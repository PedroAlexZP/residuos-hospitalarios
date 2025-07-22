"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function EditarReportePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    usuario_id: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    titulo?: string
    descripcion?: string
    fecha?: string
    usuario_id?: string
  }>({})

  useEffect(() => {
    const fetchReporte = async () => {
      const { data } = await supabase
        .from("reportes")
        .select("titulo, descripcion, fecha, usuario_id")
        .eq("id", id)
        .single()
      if (data) {
        setForm({
          titulo: data.titulo,
          descripcion: data.descripcion,
          fecha: data.fecha,
          usuario_id: data.usuario_id,
        })
      }
    }
    fetchReporte()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}
    if (!form.titulo || form.titulo.length < 3) newErrors.titulo = "El título es obligatorio."
    if (!form.descripcion || form.descripcion.length < 5) newErrors.descripcion = "La descripción es obligatoria."
    if (!form.fecha) newErrors.fecha = "La fecha es obligatoria."
    if (!form.usuario_id || form.usuario_id.length < 8) newErrors.usuario_id = "El ID de usuario es obligatorio y debe ser válido."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const { error } = await supabase
      .from("reportes")
      .update({
        titulo: form.titulo,
        descripcion: form.descripcion,
        fecha: form.fecha,
        usuario_id: form.usuario_id,
      })
      .eq("id", id)
    setLoading(false)
    if (!error) {
      alert("Reporte actualizado correctamente!")
      router.push("/reportes")
    } else {
      alert("Error al actualizar reporte")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Reporte</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" name="titulo" value={form.titulo} onChange={handleChange} required />
          {errors.titulo && <div className="text-red-500 text-sm mt-1">{errors.titulo}</div>}
        </div>
        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Input id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} required />
          {errors.descripcion && <div className="text-red-500 text-sm mt-1">{errors.descripcion}</div>}
        </div>
        <div>
          <Label htmlFor="fecha">Fecha</Label>
          <Input id="fecha" name="fecha" type="date" value={form.fecha} onChange={handleChange} required />
          {errors.fecha && <div className="text-red-500 text-sm mt-1">{errors.fecha}</div>}
        </div>
        <div>
          <Label htmlFor="usuario_id">ID Usuario</Label>
          <Input id="usuario_id" name="usuario_id" value={form.usuario_id} onChange={handleChange} required />
          {errors.usuario_id && <div className="text-red-500 text-sm mt-1">{errors.usuario_id}</div>}
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
