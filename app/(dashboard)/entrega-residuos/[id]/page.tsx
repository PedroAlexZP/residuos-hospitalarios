"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function EntregaResiduoDetallePage() {
  const params = useParams();
  const { id } = params;
  const [detalle, setDetalle] = useState<any>(null)

  useEffect(() => {
    const fetchDetalle = async () => {
      const { data } = await supabase
        .from("entrega_residuos")
        .select("*")
        .eq("id", id)
        .single()
      setDetalle(data)
    }
    fetchDetalle()
  }, [id])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle Relación Entrega-Residuo</h1>
      {detalle ? (
        <div className="space-y-2">
          <div><b>ID:</b> {detalle.id}</div>
          <div><b>Entrega:</b> {detalle.entrega_id}</div>
          <div><b>Residuo:</b> {detalle.residuo_id}</div>
        </div>
      ) : (
        <div className="text-muted-foreground">Cargando información...</div>
      )}
    </div>
  )
}
