"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

export default function EliminarResiduoPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  // Aquí deberías agregar la lógica para eliminar el residuo
  const handleDelete = async () => {
    await getCurrentUser() // Si necesitas validar usuario, si no, puedes quitar esta línea
    const { error } = await supabase
      .from("residuos")
      .delete()
      .eq("id", id)
    if (!error) {
      alert(`Residuo eliminado correctamente`)
      router.push("/residuos")
    } else {
      alert("Error al eliminar residuo")
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Eliminar Residuo</h1>
      <p>¿Estás seguro que deseas eliminar el residuo con ID: <span className="font-mono">{id}</span>?</p>
      <div className="mt-6 flex gap-4">
        <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </div>
  );
} 