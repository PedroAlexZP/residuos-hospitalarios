"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function DetalleCapacitacionPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [capacitacion, setCapacitacion] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCapacitacion = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("capacitaciones")
        .select("*")
        .eq("id", id)
        .single()
      setCapacitacion(data)
      setLoading(false)
    }
    fetchCapacitacion()
  }, [id])

  if (loading) return <div className="p-6">Cargando...</div>
  if (!capacitacion) return <div className="p-6">No se encontró la capacitación.</div>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Detalle de Capacitación</h1>
      <div className="space-y-2">
        <div><b>ID:</b> <span className="font-mono">{capacitacion.id}</span></div>
        <div><b>Tema:</b> {capacitacion.tema}</div>
        <div><b>Descripción:</b> {capacitacion.descripcion}</div>
        <div><b>Fecha:</b> {capacitacion.fecha}</div>
        <div><b>Responsable:</b> {capacitacion.responsable}</div>
        <div><b>Creado:</b> {capacitacion.created_at ? new Date(capacitacion.created_at).toLocaleString() : "-"}</div>
      </div>
      <div className="flex gap-2 mt-6">
        <Button onClick={() => router.push(`/capacitaciones/${id}/editar`)}>Editar</Button>
        <Button variant="destructive" onClick={() => router.push(`/capacitaciones/${id}/eliminar`)}>Eliminar</Button>
        <Button variant="outline" onClick={() => router.push("/capacitaciones")}>Volver</Button>
      </div>
    </div>
  )
}
