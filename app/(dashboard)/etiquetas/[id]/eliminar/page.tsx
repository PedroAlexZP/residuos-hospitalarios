"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function EliminarEtiquetaPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  // Lógica real para eliminar la etiqueta
  const handleDelete = async () => {
    const { error } = await supabase
      .from("etiquetas")
      .delete()
      .eq("id", id)
    if (!error) {
      alert(`Etiqueta eliminada correctamente`)
      router.push("/etiquetas")
    } else {
      alert("Error al eliminar etiqueta")
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Eliminar Etiqueta</h1>
      <p>¿Estás seguro que deseas eliminar la etiqueta con ID: <span className="font-mono">{id}</span>?</p>
      <div className="mt-6 flex gap-4">
        <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </div>
  );
} 