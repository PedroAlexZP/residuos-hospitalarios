"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function PesajeDetallePage() {
  const params = useParams();
  const { id } = params;
  const [pesaje, setPesaje] = useState<any>(null)

  useEffect(() => {
    const fetchPesaje = async () => {
      const { data } = await supabase
        .from("pesajes")
        .select("*")
        .eq("id", id)
        .single()
      setPesaje(data)
    }
    fetchPesaje()
  }, [id])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle del Pesaje</h1>
      {pesaje ? (
        <div className="space-y-2">
          <div><b>ID:</b> {pesaje.id}</div>
          <div><b>Residuo:</b> {pesaje.residuo_id}</div>
          <div><b>Peso (kg):</b> {pesaje.peso}</div>
          <div><b>Fecha/Hora:</b> {pesaje.fecha_hora}</div>
          <div><b>Responsable:</b> {pesaje.responsable_id}</div>
          <div><b>Código Escaneado:</b> {pesaje.codigo_escaneado}</div>
          <div><b>Observaciones:</b> {pesaje.observaciones}</div>
        </div>
      ) : (
        <div className="text-muted-foreground">Cargando información...</div>
      )}
    </div>
  )
}
