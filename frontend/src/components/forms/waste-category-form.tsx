"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WasteCategory } from "@/lib/types"

interface WasteCategoryFormProps {
  wasteCategory?: WasteCategory
  onSuccess?: () => void
}

export function WasteCategoryForm({ wasteCategory, onSuccess }: WasteCategoryFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{wasteCategory ? 'Editar' : 'Crear'} Categoría de Residuos</CardTitle>
        <CardDescription>Formulario en desarrollo</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Formulario en desarrollo...</p>
        {wasteCategory && <p>Editando: {wasteCategory.name}</p>}
        <Button onClick={onSuccess} className="mt-4">
          Guardar
        </Button>
      </CardContent>
    </Card>
  )
}
