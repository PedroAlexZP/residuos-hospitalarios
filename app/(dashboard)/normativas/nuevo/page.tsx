"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function NuevaNormativaPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    enlace: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    nombre?: string
    descripcion?: string
    fecha?: string
    enlace?: string
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}
    if (!form.nombre || form.nombre.length < 3) newErrors.nombre = "El nombre es obligatorio."
    if (!form.descripcion || form.descripcion.length < 5) newErrors.descripcion = "La descripción es obligatoria."
    if (!form.fecha) newErrors.fecha = "La fecha es obligatoria."
    if (form.enlace && !/^https?:\/\/.+/.test(form.enlace)) newErrors.enlace = "El enlace debe ser una URL válida."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const { error } = await supabase
      .from("normativas")
      .insert({
        nombre: form.nombre,
        descripcion: form.descripcion,
        fecha: form.fecha,
        enlace: form.enlace,
      })
    setLoading(false)
    if (!error) {
      alert("Normativa creada correctamente!")
      router.push("/normativas")
    } else {
      alert("Error al crear normativa")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nueva Normativa</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          {errors.nombre && <div className="text-red-500 text-sm mt-1">{errors.nombre}</div>}
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
          <Label htmlFor="enlace">Enlace (opcional)</Label>
          <Input id="enlace" name="enlace" value={form.enlace} onChange={handleChange} type="url" />
          {errors.enlace && <div className="text-red-500 text-sm mt-1">{errors.enlace}</div>}
        </div>
        <div className="flex gap-2 mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear normativa"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
