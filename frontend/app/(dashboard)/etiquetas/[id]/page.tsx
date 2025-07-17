"use client"

import { useParams } from "next/navigation"

export default function EtiquetaDetallePage() {
  const params = useParams();
  const { id } = params;

  // Aquí deberías cargar los datos de la etiqueta usando el id

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle de la Etiqueta</h1>
      <p>ID: {id}</p>
      {/* Aquí muestra la información de la etiqueta */}
      <div className="mt-4 text-muted-foreground">(Aquí irá la información detallada de la etiqueta)</div>
    </div>
  );
} 