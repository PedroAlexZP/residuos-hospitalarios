"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function EditarCapacitacionPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [form, setForm] = useState({
    tema: "",
    descripcion: "",
    fecha: "",
    responsable: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    tema?: string
    descripcion?: string
    fecha?: string
    responsable?: string
  }>({})

  useEffect(() => {
    const fetchCapacitacion = async () => {
      const { data } = await supabase
        .from("capacitaciones")
        .select("tema, descripcion, fecha, responsable")
        .eq("id", id)
        .single()
      if (data) {
        setForm({
          tema: data.tema,
          descripcion: data.descripcion,
          fecha: data.fecha,
          responsable: data.responsable,
        })
      }
    }
    fetchCapacitacion()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}
    if (!form.tema || form.tema.length < 3) newErrors.tema = "El tema es obligatorio."
    if (!form.descripcion || form.descripcion.length < 5) newErrors.descripcion = "La descripción es obligatoria."
    if (!form.fecha) newErrors.fecha = "La fecha es obligatoria."
    if (!form.responsable || form.responsable.length < 3) newErrors.responsable = "El responsable es obligatorio."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const { error } = await supabase
      .from("capacitaciones")
      .update({
        tema: form.tema,
        descripcion: form.descripcion,
        fecha: form.fecha,
        responsable: form.responsable,
      })
      .eq("id", id)
    setLoading(false)
    if (!error) {
      alert("Capacitación actualizada correctamente!")
      router.push("/capacitaciones")
    } else {
      alert("Error al actualizar capacitación")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Capacitación</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="tema">Tema</Label>
          <Input id="tema" name="tema" value={form.tema} onChange={handleChange} required />
          {errors.tema && <div className="text-red-500 text-sm mt-1">{errors.tema}</div>}
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
          <Label htmlFor="responsable">Responsable</Label>
          <Input id="responsable" name="responsable" value={form.responsable} onChange={handleChange} required />
          {errors.responsable && <div className="text-red-500 text-sm mt-1">{errors.responsable}</div>}
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
