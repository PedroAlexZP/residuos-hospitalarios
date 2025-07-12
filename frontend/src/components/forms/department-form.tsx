"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateDepartment, useUpdateDepartment } from "@/lib/queries"
import type { DepartmentAttribute } from "@/lib/types"

const departmentSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  location: z.string().optional(),
})

type DepartmentFormData = z.infer<typeof departmentSchema>

interface DepartmentFormProps {
  department?: DepartmentAttribute
  onSuccess?: () => void
}

export function DepartmentForm({ department, onSuccess }: DepartmentFormProps) {
  const createMutation = useCreateDepartment()
  const updateMutation = useUpdateDepartment()

  const isEditing = !!department

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || "",
      location: department?.location || "",
    },
  })

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: department.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Departamento" : "Crear Departamento"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica la información del departamento"
            : "Completa la información para crear un nuevo departamento"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Ej: Cirugía General"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Textarea
              id="location"
              placeholder="Descripción de la ubicación del departamento..."
              rows={3}
              {...register("location")}
            />
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

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
