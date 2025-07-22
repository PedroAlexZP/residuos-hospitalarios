"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function EditarCapacitacionParticipantePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [form, setForm] = useState({
    capacitacion_id: "",
    participante_id: "",
    asistencia: false,
    calificacion: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    capacitacion_id?: string
    participante_id?: string
    calificacion?: string
  }>({})

  useEffect(() => {
    const fetchParticipante = async () => {
      const { data } = await supabase
        .from("capacitacion_participantes")
        .select("capacitacion_id, participante_id, asistencia, calificacion")
        .eq("id", id)
        .single()
      if (data) {
        setForm({
          capacitacion_id: data.capacitacion_id,
          participante_id: data.participante_id,
          asistencia: data.asistencia,
          calificacion: data.calificacion?.toString() ?? "",
        })
      }
    }
    fetchParticipante()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked })
    } else {
      setForm({ ...form, [name]: value })
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}
    if (!form.capacitacion_id) newErrors.capacitacion_id = "El ID de capacitación es obligatorio."
    if (!form.participante_id) newErrors.participante_id = "El ID de participante es obligatorio."
    if (form.calificacion && isNaN(Number(form.calificacion))) newErrors.calificacion = "La calificación debe ser un número."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const { error } = await supabase
      .from("capacitacion_participantes")
      .update({
        capacitacion_id: form.capacitacion_id,
        participante_id: form.participante_id,
        asistencia: form.asistencia,
        calificacion: form.calificacion ? Number(form.calificacion) : null,
      })
      .eq("id", id)
    setLoading(false)
    if (!error) {
      alert("Participante actualizado correctamente!")
      router.push("/capacitacion_participantes")
    } else {
      alert("Error al actualizar participante")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Participante</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="capacitacion_id">ID Capacitación</Label>
          <Input id="capacitacion_id" name="capacitacion_id" value={form.capacitacion_id} onChange={handleChange} required />
          {errors.capacitacion_id && <div className="text-red-500 text-sm mt-1">{errors.capacitacion_id}</div>}
        </div>
        <div>
          <Label htmlFor="participante_id">ID Participante</Label>
          <Input id="participante_id" name="participante_id" value={form.participante_id} onChange={handleChange} required />
          {errors.participante_id && <div className="text-red-500 text-sm mt-1">{errors.participante_id}</div>}
        </div>
        <div>
          <Label htmlFor="asistencia">Asistencia</Label>
          <input id="asistencia" name="asistencia" type="checkbox" checked={form.asistencia} onChange={handleChange} className="ml-2" />
        </div>
        <div>
          <Label htmlFor="calificacion">Calificación</Label>
          <Input id="calificacion" name="calificacion" value={form.calificacion} onChange={handleChange} type="number" min="0" max="100" />
          {errors.calificacion && <div className="text-red-500 text-sm mt-1">{errors.calificacion}</div>}
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
