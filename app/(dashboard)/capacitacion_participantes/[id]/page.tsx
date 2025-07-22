"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function DetalleCapacitacionParticipantePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [participante, setParticipante] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchParticipante = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("capacitacion_participantes")
        .select("*")
        .eq("id", id)
        .single()
      setParticipante(data)
      setLoading(false)
    }
    fetchParticipante()
  }, [id])

  if (loading) return <div className="p-6">Cargando...</div>
  if (!participante) return <div className="p-6">No se encontró el participante.</div>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Detalle de Participante</h1>
      <div className="space-y-2">
        <div><b>ID:</b> <span className="font-mono">{participante.id}</span></div>
        <div><b>ID Capacitación:</b> {participante.capacitacion_id}</div>
        <div><b>ID Participante:</b> {participante.participante_id}</div>
        <div><b>Asistencia:</b> {participante.asistencia ? "Sí" : "No"}</div>
        <div><b>Calificación:</b> {participante.calificacion ?? "-"}</div>
        <div><b>Creado:</b> {participante.created_at ? new Date(participante.created_at).toLocaleString() : "-"}</div>
      </div>
      <div className="flex gap-2 mt-6">
        <Button onClick={() => router.push(`/capacitacion_participantes/${id}/editar`)}>Editar</Button>
        <Button variant="destructive" onClick={() => router.push(`/capacitacion_participantes/${id}/eliminar`)}>Eliminar</Button>
        <Button variant="outline" onClick={() => router.push("/capacitacion_participantes")}>Volver</Button>
      </div>
    </div>
  )
}
