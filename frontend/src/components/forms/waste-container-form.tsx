"use client"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateWasteContainer, useUpdateWasteContainer, useWasteCategories } from "@/lib/queries"
import type { WasteContainer } from "@/lib/types"

const wasteContainerSchema = z.object({
  capacity: z.number().min(1, "La capacidad debe ser mayor a 0"),
  location: z.string().min(1, "La ubicación es requerida"),
  status_name: z.string().optional(),
  category: z.string().optional(),
})

interface WasteContainerFormProps {
  wasteContainer?: WasteContainer
  onSuccess?: () => void
}

export function WasteContainerForm({ wasteContainer, onSuccess }: WasteContainerFormProps) {
  const createMutation = useCreateWasteContainer()
  const updateMutation = useUpdateWasteContainer()
  const { data: categories = [] } = useWasteCategories()

  const isEditing = !!wasteContainer

  const form = useForm({
    defaultValues: {
      capacity: wasteContainer?.capacity || 0,
      location: wasteContainer?.location || "",
      status_name: wasteContainer?.status_name || "",
      category: wasteContainer?.category?.id || "",
    },
    onSubmit: async ({ value }) => {
      try {
        const submitData = {
          ...value,
          category: value.category || undefined,
        }

        if (isEditing) {
          await updateMutation.mutateAsync({ id: wasteContainer.id, data: submitData })
        } else {
          await createMutation.mutateAsync(submitData)
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
        <CardTitle>{isEditing ? "Editar Contenedor" : "Crear Contenedor"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica la información del contenedor"
            : "Completa la información para crear un nuevo contenedor"}
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
              name="capacity"
              validators={{
                onChange: wasteContainerSchema.shape.capacity,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Capacidad (L) *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="1"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number.parseInt(e.target.value) || 0)}
                    placeholder="Ej: 50"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="status_name"
              validators={{
                onChange: wasteContainerSchema.shape.status_name,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Estado</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empty">Vacío</SelectItem>
                      <SelectItem value="partial">Parcial</SelectItem>
                      <SelectItem value="full">Lleno</SelectItem>
                      <SelectItem value="sealed">Sellado</SelectItem>
                      <SelectItem value="collected">Recolectado</SelectItem>
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="category"
            validators={{
              onChange: wasteContainerSchema.shape.category,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Categoría</Label>
                <Select value={field.state.value} onValueChange={field.handleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="location"
            validators={{
              onChange: wasteContainerSchema.shape.location,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Ubicación *</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe la ubicación del contenedor..."
                  rows={3}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
