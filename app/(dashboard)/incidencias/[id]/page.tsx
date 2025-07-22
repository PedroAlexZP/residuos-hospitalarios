"use client"

import { useParams } from "next/navigation"

export default function IncidenciaDetallePage() {
  const params = useParams();
  const { id } = params;

  // Aquí deberías cargar los datos de la incidencia usando el id

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle de la Incidencia</h1>
      <p>ID: {id}</p>
      {/* Aquí muestra la información de la incidencia */}
      <div className="mt-4 text-muted-foreground">(Aquí irá la información detallada de la incidencia)</div>
    </div>
  );
} 