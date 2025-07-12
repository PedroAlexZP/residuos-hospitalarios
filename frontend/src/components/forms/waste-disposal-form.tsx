"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WasteDisposalFormProps {
  onSuccess?: () => void
}

export function WasteDisposalForm({ onSuccess }: WasteDisposalFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Disposición de Residuos</CardTitle>
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
