"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"

export default function PesajesPage() {
  const [pesajes, setPesajes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPesajes = async () => {
      const { data } = await supabase
        .from("pesajes")
        .select("id, residuo_id, peso, fecha_hora, responsable_id, codigo_escaneado, observaciones")
        .order("fecha_hora", { ascending: false })
      setPesajes(data || [])
      setLoading(false)
    }
    fetchPesajes()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pesajes</h1>
      <Button asChild className="mb-4">
        <Link href="/pesajes/nuevo">Nuevo Pesaje</Link>
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Residuo</TableHead>
            <TableHead>Peso (kg)</TableHead>
            <TableHead>Fecha/Hora</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Código Escaneado</TableHead>
            <TableHead>Observaciones</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pesajes.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.id}</TableCell>
              <TableCell>{p.residuo_id}</TableCell>
              <TableCell>{p.peso}</TableCell>
              <TableCell>{p.fecha_hora}</TableCell>
              <TableCell>{p.responsable_id}</TableCell>
              <TableCell>{p.codigo_escaneado}</TableCell>
              <TableCell>{p.observaciones}</TableCell>
              <TableCell>
                <Link href={`/pesajes/${p.id}/editar`}><Button size="sm">Editar</Button></Link>
                <Link href={`/pesajes/${p.id}/eliminar`}><Button size="sm" variant="destructive">Eliminar</Button></Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {loading && <div className="mt-4">Cargando...</div>}
    </div>
  )
}
