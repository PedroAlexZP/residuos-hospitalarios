"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WasteContainer } from "@/lib/types"

interface WasteContainerFormProps {
  wasteContainer?: WasteContainer
  onSuccess?: () => void
}

export function WasteContainerForm({ wasteContainer, onSuccess }: WasteContainerFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{wasteContainer ? 'Editar' : 'Crear'} Contenedor de Residuos</CardTitle>
        <CardDescription>Formulario en desarrollo</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Formulario en desarrollo...</p>
        {wasteContainer && <p>Editando contenedor en: {wasteContainer.location}</p>}
        <Button onClick={onSuccess} className="mt-4">
          Guardar
        </Button>
      </CardContent>
    </Card>
  )
}
