"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function EditarEntregaPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [form, setForm] = useState({
    gestor_externo_id: "",
    certificado_pdf: "",
    usuario_id: "",
    estado: "pendiente",
    numero_seguimiento: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    gestor_externo_id?: string
    usuario_id?: string
    estado?: string
    numero_seguimiento?: string
  }>({})

  useEffect(() => {
    const fetchEntrega = async () => {
      const { data } = await supabase
        .from("entregas")
        .select("gestor_externo_id, certificado_pdf, usuario_id, estado, numero_seguimiento")
        .eq("id", id)
        .single()
      if (data) {
        setForm({
          gestor_externo_id: data.gestor_externo_id,
          certificado_pdf: data.certificado_pdf || "",
          usuario_id: data.usuario_id,
          estado: data.estado,
          numero_seguimiento: data.numero_seguimiento || "",
        })
      }
    }
    fetchEntrega()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const validateForm = () => {
    const newErrors: {
      gestor_externo_id?: string
      usuario_id?: string
      estado?: string
      numero_seguimiento?: string
    } = {}
    if (!form.gestor_externo_id || form.gestor_externo_id.length < 8) {
      newErrors.gestor_externo_id = "El ID del gestor externo es obligatorio y debe ser válido."
    }
    if (!form.usuario_id || form.usuario_id.length < 8) {
      newErrors.usuario_id = "El ID del usuario es obligatorio y debe ser válido."
    }
    if (!form.estado || !["pendiente", "confirmada", "tratada"].includes(form.estado)) {
      newErrors.estado = "Selecciona un estado válido."
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const { error } = await supabase
      .from("entregas")
      .update({
        gestor_externo_id: form.gestor_externo_id,
        certificado_pdf: form.certificado_pdf,
        usuario_id: form.usuario_id,
        estado: form.estado,
        numero_seguimiento: form.numero_seguimiento,
      })
      .eq("id", id)
    setLoading(false)
    if (!error) {
      alert("Entrega actualizada correctamente!")
      router.push("/entregas")
    } else {
      alert("Error al actualizar entrega")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Entrega</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="gestor_externo_id">ID Gestor Externo</Label>
          <Input id="gestor_externo_id" name="gestor_externo_id" value={form.gestor_externo_id} onChange={handleChange} required />
          {errors.gestor_externo_id && <div className="text-red-500 text-sm mt-1">{errors.gestor_externo_id}</div>}
        </div>
        <div>
          <Label htmlFor="certificado_pdf">Certificado PDF (URL)</Label>
          <Input id="certificado_pdf" name="certificado_pdf" value={form.certificado_pdf} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="usuario_id">ID Usuario</Label>
          <Input id="usuario_id" name="usuario_id" value={form.usuario_id} onChange={handleChange} required />
          {errors.usuario_id && <div className="text-red-500 text-sm mt-1">{errors.usuario_id}</div>}
        </div>
        <div>
          <Label htmlFor="estado">Estado</Label>
          <select id="estado" name="estado" value={form.estado} onChange={handleChange} className="w-full border rounded px-2 py-2" required>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="tratada">Tratada</option>
          </select>
          {errors.estado && <div className="text-red-500 text-sm mt-1">{errors.estado}</div>}
        </div>
        <div>
          <Label htmlFor="numero_seguimiento">N° Seguimiento</Label>
          <Input id="numero_seguimiento" name="numero_seguimiento" value={form.numero_seguimiento} onChange={handleChange} />
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
