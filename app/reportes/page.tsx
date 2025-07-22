"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function ReportesPage() {
  const [reportes, setReportes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("reportes")
        .select("*")
        .order("created_at", { ascending: false })
      setReportes(data || [])
      setLoading(false)
    }
    fetchReportes()
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <Button onClick={() => router.push("/reportes/nuevo")}>Nuevo reporte</Button>
      </div>
      {loading ? (
        <div>Cargando...</div>
      ) : reportes.length === 0 ? (
        <div>No hay reportes registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Título</th>
                <th className="border px-2 py-1">Descripción</th>
                <th className="border px-2 py-1">Fecha</th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((r) => (
                <tr key={r.id}>
                  <td className="border px-2 py-1 font-mono">{r.id}</td>
                  <td className="border px-2 py-1">{r.titulo}</td>
                  <td className="border px-2 py-1">{r.descripcion}</td>
                  <td className="border px-2 py-1">{r.fecha}</td>
                  <td className="border px-2 py-1">
                    <Button size="sm" onClick={() => router.push(`/reportes/${r.id}`)}>Ver</Button>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/reportes/${r.id}/editar`)} className="ml-2">Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => router.push(`/reportes/${r.id}/eliminar`)} className="ml-2">Eliminar</Button>
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
