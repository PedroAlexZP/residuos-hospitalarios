"use client"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateWasteCategory, useUpdateWasteCategory } from "@/lib/queries"
import type { WasteCategory } from "@/lib/types"

const wasteCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  handling_protocol: z.string().min(1, "El protocolo de manejo es requerido"),
  disposal_method: z.string().min(1, "El método de disposición es requerido"),
  hazard_level: z.string().optional(),
})

interface WasteCategoryFormProps {
  wasteCategory?: WasteCategory
  onSuccess?: () => void
}

export function WasteCategoryForm({ wasteCategory, onSuccess }: WasteCategoryFormProps) {
  const createMutation = useCreateWasteCategory()
  const updateMutation = useUpdateWasteCategory()

  const isEditing = !!wasteCategory

  const form = useForm({
    defaultValues: {
      name: wasteCategory?.name || "",
      handling_protocol: wasteCategory?.handling_protocol || "",
      disposal_method: wasteCategory?.disposal_method || "",
      hazard_level: wasteCategory?.hazard_level || "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditing) {
          await updateMutation.mutateAsync({ id: wasteCategory.id, data: value })
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
        <CardTitle>{isEditing ? "Editar Categoría de Residuo" : "Crear Categoría de Residuo"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica la información de la categoría"
            : "Completa la información para crear una nueva categoría"}
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
          <form.Field
            name="name"
            validators={{
              onChange: wasteCategorySchema.shape.name,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Nombre *</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Residuos Patológicos"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="hazard_level"
            validators={{
              onChange: wasteCategorySchema.shape.hazard_level,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Nivel de Peligro</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Alto, Medio, Bajo"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="handling_protocol"
            validators={{
              onChange: wasteCategorySchema.shape.handling_protocol,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Protocolo de Manejo *</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe el protocolo de manejo para esta categoría..."
                  rows={4}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="disposal_method"
            validators={{
              onChange: wasteCategorySchema.shape.disposal_method,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Método de Disposición *</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe el método de disposición final..."
                  rows={4}
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
