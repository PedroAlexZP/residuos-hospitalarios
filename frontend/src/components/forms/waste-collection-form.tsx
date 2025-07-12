"use client"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateWasteCollection, useUpdateWasteCollection } from "@/lib/queries"
import type { WasteCollection } from "@/lib/types"

const wasteCollectionSchema = z.object({
  collection_date: z.string().min(1, "La fecha de recolección es requerida"),
  collected_by: z.string().min(1, "El recolector es requerido"),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
})

interface WasteCollectionFormProps {
  wasteCollection?: WasteCollection
  onSuccess?: () => void
}

export function WasteCollectionForm({ wasteCollection, onSuccess }: WasteCollectionFormProps) {
  const createMutation = useCreateWasteCollection()
  const updateMutation = useUpdateWasteCollection()

  const isEditing = !!wasteCollection

  const form = useForm({
    defaultValues: {
      collection_date: wasteCollection?.collection_date ? wasteCollection.collection_date.split("T")[0] : "",
      collected_by: wasteCollection?.collected_by || "",
      quantity: wasteCollection?.quantity || 0,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditing) {
          await updateMutation.mutateAsync({ id: wasteCollection.id, data: value })
        } else {
          await createMutation.mutateAsync(value)
        }
        onSuccess?.()
      } catch (error) {
        console.error("Error submitting form:", error)
      }
    },
    validatorAdapter: zodValidator(),
  })

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Recolección" : "Registrar Recolección"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica la información de la recolección"
            : "Completa la información para registrar una nueva recolección"}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
