"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WasteCollectionFormProps {
  onSuccess?: () => void
}

export function WasteCollectionForm({ onSuccess }: WasteCollectionFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recolección de Residuos</CardTitle>
        <CardDescription>Formulario en desarrollo</CardDescription>
      </CardHeader>
      <CardContent>
<<<<<<< HEAD
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="collection_date"
              validators={{
                onChange: wasteCollectionSchema.shape.collection_date,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Fecha de Recolección *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]?.message}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="quantity"
              validators={{
                onChange: wasteCollectionSchema.shape.quantity,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Cantidad *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="1"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number.parseInt(e.target.value) || 0)}
                    placeholder="Número de elementos recolectados"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]?.message}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="collected_by"
            validators={{
              onChange: wasteCollectionSchema.shape.collected_by,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Recolectado por *</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Nombre del responsable de la recolección"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">{field.state.meta.errors[0]?.message}</p>
                )}
              </div>
            )}
          </form.Field>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Registrar"}
            </Button>
          </div>
        </form>
=======
        <p>Formulario en desarrollo...</p>
        <Button onClick={onSuccess} className="mt-4">
          Guardar
        </Button>
>>>>>>> 73da3e6f58d7b198fec3cea8715ed2f9f24db4f1
      </CardContent>
    </Card>
  )
}
