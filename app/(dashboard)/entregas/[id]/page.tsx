"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function EntregaDetallePage() {
  const params = useParams();
  const { id } = params;
  const [entrega, setEntrega] = useState<any>(null)

  useEffect(() => {
    const fetchEntrega = async () => {
      const { data } = await supabase
        .from("entregas")
        .select("*")
        .eq("id", id)
        .single()
      setEntrega(data)
    }
    fetchEntrega()
  }, [id])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle de la Entrega</h1>
      {entrega ? (
        <div className="space-y-2">
          <div><b>ID:</b> {entrega.id}</div>
          <div><b>Gestor Externo:</b> {entrega.gestor_externo_id}</div>
          <div><b>Fecha/Hora:</b> {entrega.fecha_hora}</div>
          <div><b>Certificado PDF:</b> {entrega.certificado_pdf}</div>
          <div><b>Usuario:</b> {entrega.usuario_id}</div>
          <div><b>Estado:</b> {entrega.estado}</div>
          <div><b>N° Seguimiento:</b> {entrega.numero_seguimiento}</div>
        </div>
      ) : (
        <div className="text-muted-foreground">Cargando información...</div>
      )}
    </div>
  )
}
