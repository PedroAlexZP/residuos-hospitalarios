"use client"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateWasteDisposal, useUpdateWasteDisposal } from "@/lib/queries"
import type { WasteDisposal } from "@/lib/types"

const wasteDisposalSchema = z.object({
  disposal_date: z.string().min(1, "La fecha de disposición es requerida"),
  disposal_method: z.string().min(1, "El método de disposición es requerido"),
  disposal_location: z.string().min(1, "La ubicación de disposición es requerida"),
  certificate_number: z.string().optional(),
})

interface WasteDisposalFormProps {
  wasteDisposal?: WasteDisposal
  onSuccess?: () => void
}

export function WasteDisposalForm({ wasteDisposal, onSuccess }: WasteDisposalFormProps) {
  const createMutation = useCreateWasteDisposal()
  const updateMutation = useUpdateWasteDisposal()

  const isEditing = !!wasteDisposal

  const form = useForm({
    defaultValues: {
      disposal_date: wasteDisposal?.disposal_date ? wasteDisposal.disposal_date.split("T")[0] : "",
      disposal_method: wasteDisposal?.disposal_method || "",
      disposal_location: wasteDisposal?.disposal_location || "",
      certificate_number: wasteDisposal?.certificate_number || "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditing) {
          await updateMutation.mutateAsync({ id: wasteDisposal.id, data: value })
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
        <CardTitle>{isEditing ? "Editar Disposición" : "Registrar Disposición"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica la información de la disposición"
            : "Completa la información para registrar una nueva disposición"}
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
              name="disposal_date"
              validators={{
                onChange: wasteDisposalSchema.shape.disposal_date,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Fecha de Disposición *</Label>
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
              name="certificate_number"
              validators={{
                onChange: wasteDisposalSchema.shape.certificate_number,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Número de Certificado</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: CERT-2024-001"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]?.message}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="disposal_method"
            validators={{
              onChange: wasteDisposalSchema.shape.disposal_method,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Método de Disposición *</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Incineración, Autoclave, Enterramiento"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">{field.state.meta.errors[0]?.message}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="disposal_location"
            validators={{
              onChange: wasteDisposalSchema.shape.disposal_location,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Ubicación de Disposición *</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Dirección o ubicación del sitio de disposición"
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
