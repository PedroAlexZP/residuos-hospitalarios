"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WasteHandlerFormProps {
  onSuccess?: () => void
}

export function WasteHandlerForm({ onSuccess }: WasteHandlerFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manejador de Residuos</CardTitle>
        <CardDescription>Formulario en desarrollo</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Formulario en desarrollo...</p>
        <Button onClick={onSuccess} className="mt-4">
          Guardar
        </Button>
      </CardContent>
    </Card>
  )
}
