"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function EliminarEntregaPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const handleDelete = async () => {
    const { error } = await supabase
      .from("entregas")
      .delete()
      .eq("id", id)
    if (!error) {
      alert("Entrega eliminada correctamente!")
      router.push("/entregas")
    } else {
      alert("Error al eliminar entrega")
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Eliminar Entrega</h1>
      <p>¿Estás seguro que deseas eliminar la entrega con ID: <span className="font-mono">{id}</span>?</p>
      <div className="mt-6 flex gap-4">
        <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </div>
  );
}
