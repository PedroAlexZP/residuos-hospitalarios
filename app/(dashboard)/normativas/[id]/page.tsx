"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function DetalleNormativaPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [normativa, setNormativa] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNormativa = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("normativas")
        .select("*")
        .eq("id", id)
        .single()
      setNormativa(data)
      setLoading(false)
    }
    fetchNormativa()
  }, [id])

  if (loading) return <div className="p-6">Cargando...</div>
  if (!normativa) return <div className="p-6">No se encontró la normativa.</div>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Detalle de Normativa</h1>
      <div className="space-y-2">
        <div><b>ID:</b> <span className="font-mono">{normativa.id}</span></div>
        <div><b>Nombre:</b> {normativa.nombre}</div>
        <div><b>Descripción:</b> {normativa.descripcion}</div>
        <div><b>Fecha:</b> {normativa.fecha}</div>
        <div><b>Enlace:</b> {normativa.enlace ? <a href={normativa.enlace} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Ver</a> : "-"}</div>
        <div><b>Creado:</b> {normativa.created_at ? new Date(normativa.created_at).toLocaleString() : "-"}</div>
      </div>
      <div className="flex gap-2 mt-6">
        <Button onClick={() => router.push(`/normativas/${id}/editar`)}>Editar</Button>
        <Button variant="destructive" onClick={() => router.push(`/normativas/${id}/eliminar`)}>Eliminar</Button>
        <Button variant="outline" onClick={() => router.push("/normativas")}>Volver</Button>
      </div>
    </div>
  )
}
