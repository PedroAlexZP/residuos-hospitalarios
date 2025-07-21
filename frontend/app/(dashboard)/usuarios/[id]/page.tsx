"use client"

import { useParams } from "next/navigation"

export default function UsuarioDetallePage() {
  const params = useParams();
  const { id } = params;

  // Aquí deberías cargar los datos del usuario usando el id

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle del Usuario</h1>
      <p>ID: {id}</p>
      <div className="mt-4 text-muted-foreground">(Aquí irá la información detallada del usuario)</div>
    </div>
  );
} 