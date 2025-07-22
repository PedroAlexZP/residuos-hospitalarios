"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function EliminarDepartamentoPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  // Aquí deberías agregar la lógica para eliminar el departamento
  const handleDelete = () => {
    // Lógica para eliminar el departamento
    alert(`Departamento con ID ${id} eliminado (simulado)`);
    router.push("/departamentos");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Eliminar Departamento</h1>
      <p>¿Estás seguro que deseas eliminar el departamento con ID: <span className="font-mono">{id}</span>?</p>
      <div className="mt-6 flex gap-4">
        <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </div>
  );
} 