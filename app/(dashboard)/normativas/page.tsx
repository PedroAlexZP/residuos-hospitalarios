"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function NormativasPage() {
  const [normativas, setNormativas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchNormativas = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("normativas")
        .select("*")
        .order("fecha", { ascending: false })
      setNormativas(data || [])
      setLoading(false)
    }
    fetchNormativas()
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Normativas</h1>
        <Button onClick={() => router.push("/normativas/nuevo")}>Nueva normativa</Button>
      </div>
      {loading ? (
        <div>Cargando...</div>
      ) : normativas.length === 0 ? (
        <div>No hay normativas registradas.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Nombre</th>
                <th className="border px-2 py-1">Descripción</th>
                <th className="border px-2 py-1">Fecha</th>
                <th className="border px-2 py-1">Enlace</th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {normativas.map((n) => (
                <tr key={n.id}>
                  <td className="border px-2 py-1 font-mono">{n.id}</td>
                  <td className="border px-2 py-1">{n.nombre}</td>
                  <td className="border px-2 py-1">{n.descripcion}</td>
                  <td className="border px-2 py-1">{n.fecha}</td>
                  <td className="border px-2 py-1">
                    {n.enlace ? <a href={n.enlace} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Ver</a> : "-"}
                  </td>
                  <td className="border px-2 py-1">
                    <Button size="sm" onClick={() => router.push(`/normativas/${n.id}`)}>Ver</Button>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/normativas/${n.id}/editar`)} className="ml-2">Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => router.push(`/normativas/${n.id}/eliminar`)} className="ml-2">Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
