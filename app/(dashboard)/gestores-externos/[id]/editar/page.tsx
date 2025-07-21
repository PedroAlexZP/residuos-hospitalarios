"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function EditarGestorExternoPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [form, setForm] = useState({
    nombre: "",
    curp: "",
    licencia: "",
    contacto: "",
    activo: true,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ nombre?: string; curp?: string; licencia?: string }>({})

  useEffect(() => {
    const fetchGestor = async () => {
      const { data } = await supabase
        .from("gestores_externos")
        .select("nombre, curp, licencia, contacto, activo")
        .eq("id", id)
        .single()
      if (data) {
        setForm({
          nombre: data.nombre,
          curp: data.curp,
          licencia: data.licencia,
          contacto: data.contacto,
          activo: data.activo,
        })
      }
    }
    fetchGestor()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === "checkbox" ? checked : value })
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validateForm = () => {
    const newErrors: { nombre?: string; curp?: string; licencia?: string } = {}
    if (!form.nombre || form.nombre.length < 3) newErrors.nombre = "El nombre es obligatorio."
    if (!form.curp || !/^([A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2})$/i.test(form.curp)) newErrors.curp = "CURP inválido."
    if (!form.licencia || form.licencia.length < 5) newErrors.licencia = "La licencia es obligatoria."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const { error } = await supabase
      .from("gestores_externos")
      .update({
        nombre: form.nombre,
        curp: form.curp,
        licencia: form.licencia,
        contacto: form.contacto,
        activo: form.activo,
      })
      .eq("id", id)
    setLoading(false)
    if (!error) {
      alert("Gestor externo actualizado correctamente!")
      router.push("/gestores-externos")
    } else {
      alert("Error al actualizar gestor externo")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Gestor Externo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          {errors.nombre && <div className="text-red-500 text-sm mt-1">{errors.nombre}</div>}
        </div>
        <div>
          <Label htmlFor="curp">CURP</Label>
          <Input id="curp" name="curp" value={form.curp} onChange={handleChange} required maxLength={18} />
          {errors.curp && <div className="text-red-500 text-sm mt-1">{errors.curp}</div>}
        </div>
        <div>
          <Label htmlFor="licencia">Licencia</Label>
          <Input id="licencia" name="licencia" value={form.licencia} onChange={handleChange} required />
          {errors.licencia && <div className="text-red-500 text-sm mt-1">{errors.licencia}</div>}
        </div>
        <div>
          <Label htmlFor="contacto">Contacto</Label>
          <Input id="contacto" name="contacto" value={form.contacto} onChange={handleChange} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="activo" name="activo" checked={form.activo} onChange={handleChange} />
          <Label htmlFor="activo">Activo</Label>
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
