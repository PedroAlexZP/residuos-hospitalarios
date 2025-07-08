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
import { useCreateMedicalWaste, useUpdateMedicalWaste, useDepartments } from "@/lib/queries"
import type { MedicalWaste } from "@/lib/types"

const medicalWasteSchema = z.object({
  generation_date: z.string().min(1, "La fecha de generación es requerida"),
  weight: z.string().min(1, "El peso es requerido"),
  description: z.string().optional(),
  department: z.string().optional(),
})

interface MedicalWasteFormProps {
  medicalWaste?: MedicalWaste
  onSuccess?: () => void
}

export function MedicalWasteForm({ medicalWaste, onSuccess }: MedicalWasteFormProps) {
  const createMutation = useCreateMedicalWaste()
  const updateMutation = useUpdateMedicalWaste()
  const { data: departments = [] } = useDepartments()

  const isEditing = !!medicalWaste

  const form = useForm({
    defaultValues: {
      generation_date: medicalWaste?.generation_date ? medicalWaste.generation_date.split("T")[0] : "",
      weight: medicalWaste?.weight || "",
      description: medicalWaste?.description || "",
      department: medicalWaste?.department?.id || "",
    },
    onSubmit: async ({ value }) => {
      try {
        const submitData = {
          ...value,
          department: value.department || undefined,
        }

        if (isEditing) {
          await updateMutation.mutateAsync({ id: medicalWaste.id, data: submitData })
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
        <CardTitle>{isEditing ? "Editar Residuo Médico" : "Registrar Residuo Médico"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica la información del residuo médico"
            : "Completa la información para registrar un nuevo residuo médico"}
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
              name="generation_date"
              validators={{
                onChange: medicalWasteSchema.shape.generation_date,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Fecha de Generación *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="weight"
              validators={{
                onChange: medicalWasteSchema.shape.weight,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Peso *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: 2.5 kg"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="department"
            validators={{
              onChange: medicalWasteSchema.shape.department,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Departamento</Label>
                <Select value={field.state.value} onValueChange={field.handleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
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
            name="description"
            validators={{
              onChange: medicalWasteSchema.shape.description,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Descripción</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe el tipo de residuo, origen, características especiales..."
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
              {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Registrar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
