"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function EliminarEtiquetaPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  // Aquí deberías agregar la lógica para eliminar la etiqueta
  const handleDelete = () => {
    // Lógica para eliminar la etiqueta
    alert(`Etiqueta con ID ${id} eliminada (simulado)`);
    router.push("/etiquetas");
  };

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