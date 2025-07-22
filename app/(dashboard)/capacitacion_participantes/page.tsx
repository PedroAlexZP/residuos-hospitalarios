"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function CapacitacionParticipantesPage() {
  const [participantes, setParticipantes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchParticipantes = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("capacitacion_participantes")
        .select("*")
        .order("capacitacion_id", { ascending: false })
      setParticipantes(data || [])
      setLoading(false)
    }
    fetchParticipantes()
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Participantes de Capacitaciones</h1>
        <Button onClick={() => router.push("/capacitacion_participantes/nuevo")}>Agregar participante</Button>
      </div>
      {loading ? (
        <div>Cargando...</div>
      ) : participantes.length === 0 ? (
        <div>No hay participantes registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Capacitación</th>
                <th className="border px-2 py-1">Participante</th>
                <th className="border px-2 py-1">Asistencia</th>
                <th className="border px-2 py-1">Calificación</th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {participantes.map((p) => (
                <tr key={p.id}>
                  <td className="border px-2 py-1 font-mono">{p.id}</td>
                  <td className="border px-2 py-1">{p.capacitacion_id}</td>
                  <td className="border px-2 py-1">{p.participante_id}</td>
                  <td className="border px-2 py-1">{p.asistencia ? "Sí" : "No"}</td>
                  <td className="border px-2 py-1">{p.calificacion ?? "-"}</td>
                  <td className="border px-2 py-1">
                    <Button size="sm" onClick={() => router.push(`/capacitacion_participantes/${p.id}`)}>Ver</Button>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/capacitacion_participantes/${p.id}/editar`)} className="ml-2">Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => router.push(`/capacitacion_participantes/${p.id}/eliminar`)} className="ml-2">Eliminar</Button>
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
