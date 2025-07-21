"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"

export default function GestoresExternosPage() {
  const [gestores, setGestores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGestores = async () => {
      const { data } = await supabase
        .from("gestores_externos")
        .select("id, nombre, curp, licencia, contacto, activo, created_at")
        .order("created_at", { ascending: false })
      setGestores(data || [])
      setLoading(false)
    }
    fetchGestores()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestores Externos</h1>
      <Button asChild className="mb-4">
        <Link href="/gestores-externos/nuevo">Nuevo Gestor</Link>
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>CURP</TableHead>
            <TableHead>Licencia</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Activo</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gestores.map((g) => (
            <TableRow key={g.id}>
              <TableCell>{g.id}</TableCell>
              <TableCell>{g.nombre}</TableCell>
              <TableCell>{g.curp}</TableCell>
              <TableCell>{g.licencia}</TableCell>
              <TableCell>{g.contacto}</TableCell>
              <TableCell>{g.activo ? "Sí" : "No"}</TableCell>
              <TableCell>
                <Link href={`/gestores-externos/${g.id}/editar`}><Button size="sm">Editar</Button></Link>
                <Link href={`/gestores-externos/${g.id}/eliminar`}><Button size="sm" variant="destructive">Eliminar</Button></Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {loading && <div className="mt-4">Cargando...</div>}
    </div>
  )
}
