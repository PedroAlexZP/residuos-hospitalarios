"use client"

import { useParams } from "next/navigation"

export default function ResiduoDetallePage() {
  const params = useParams();
  const { id } = params;

  // Aquí deberías cargar los datos del residuo usando el id

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle del Residuo</h1>
      <p>ID: {id}</p>
      {/* Aquí muestra la información del residuo */}
      <div className="mt-4 text-muted-foreground">(Aquí irá la información detallada del residuo)</div>
    </div>
  );
} 