"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"

export default function EntregaResiduosPage() {
  const [entregaResiduos, setEntregaResiduos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEntregaResiduos = async () => {
      const { data } = await supabase
        .from("entrega_residuos")
        .select("id, entrega_id, residuo_id")
        .order("id", { ascending: false })
      setEntregaResiduos(data || [])
      setLoading(false)
    }
    fetchEntregaResiduos()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Entrega de Residuos</h1>
      <Button asChild className="mb-4">
        <Link href="/entrega-residuos/nuevo">Nueva Relación</Link>
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Entrega</TableHead>
            <TableHead>Residuo</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entregaResiduos.map((er) => (
            <TableRow key={er.id}>
              <TableCell>{er.id}</TableCell>
              <TableCell>{er.entrega_id}</TableCell>
              <TableCell>{er.residuo_id}</TableCell>
              <TableCell>
                <Link href={`/entrega-residuos/${er.id}/editar`}><Button size="sm">Editar</Button></Link>
                <Link href={`/entrega-residuos/${er.id}/eliminar`}><Button size="sm" variant="destructive">Eliminar</Button></Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {loading && <div className="mt-4">Cargando...</div>}
    </div>
  )
}
