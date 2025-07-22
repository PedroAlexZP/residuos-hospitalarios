"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function DetalleReportePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [reporte, setReporte] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReporte = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("reportes")
        .select("*")
        .eq("id", id)
        .single()
      setReporte(data)
      setLoading(false)
    }
    fetchReporte()
  }, [id])

  if (loading) return <div className="p-6">Cargando...</div>
  if (!reporte) return <div className="p-6">No se encontró el reporte.</div>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Detalle de Reporte</h1>
      <div className="space-y-2">
        <div><b>ID:</b> <span className="font-mono">{reporte.id}</span></div>
        <div><b>Título:</b> {reporte.titulo}</div>
        <div><b>Descripción:</b> {reporte.descripcion}</div>
        <div><b>Fecha:</b> {reporte.fecha}</div>
        <div><b>ID Usuario:</b> {reporte.usuario_id}</div>
        <div><b>Creado:</b> {reporte.created_at ? new Date(reporte.created_at).toLocaleString() : "-"}</div>
      </div>
      <div className="flex gap-2 mt-6">
        <Button onClick={() => router.push(`/reportes/${id}/editar`)}>Editar</Button>
        <Button variant="destructive" onClick={() => router.push(`/reportes/${id}/eliminar`)}>Eliminar</Button>
        <Button variant="outline" onClick={() => router.push("/reportes")}>Volver</Button>
      </div>
    </div>
  )
}
