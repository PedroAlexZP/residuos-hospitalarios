"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function GestorExternoDetallePage() {
  const params = useParams();
  const { id } = params;
  const [gestor, setGestor] = useState<any>(null)

  useEffect(() => {
    const fetchGestor = async () => {
      const { data } = await supabase
        .from("gestores_externos")
        .select("*")
        .eq("id", id)
        .single()
      setGestor(data)
    }
    fetchGestor()
  }, [id])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle del Gestor Externo</h1>
      {gestor ? (
        <div className="space-y-2">
          <div><b>ID:</b> {gestor.id}</div>
          <div><b>Nombre:</b> {gestor.nombre}</div>
          <div><b>CURP:</b> {gestor.curp}</div>
          <div><b>Licencia:</b> {gestor.licencia}</div>
          <div><b>Contacto:</b> {gestor.contacto}</div>
          <div><b>Activo:</b> {gestor.activo ? "Sí" : "No"}</div>
          <div><b>Creado:</b> {gestor.created_at}</div>
        </div>
      ) : (
        <div className="text-muted-foreground">Cargando información...</div>
      )}
    </div>
  )
}
