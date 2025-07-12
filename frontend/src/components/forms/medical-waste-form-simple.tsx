"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const medicalWasteSchema = z.object({
  generation_date: z.string().min(1, "La fecha es requerida"),
  weight: z.string().min(1, "El peso es requerido"),
  description: z.string().optional(),
  department: z.string().min(1, "El departamento es requerido"),
})

type MedicalWasteFormData = z.infer<typeof medicalWasteSchema>

interface MedicalWasteFormProps {
  onSuccess?: () => void
}

export function MedicalWasteForm({ onSuccess }: MedicalWasteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicalWasteFormData>({
    resolver: zodResolver(medicalWasteSchema),
  })

  const onSubmit = async (data: MedicalWasteFormData) => {
    console.log("Form data:", data)
    onSuccess?.()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Residuo Médico</CardTitle>
        <CardDescription>Formulario para registrar un nuevo residuo médico</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generation_date">Fecha de Generación *</Label>
            <Input
              id="generation_date"
              type="date"
              {...register("generation_date")}
            />
            {errors.generation_date && (
              <p className="text-sm text-red-600">{errors.generation_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg) *</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              {...register("weight")}
            />
            {errors.weight && (
              <p className="text-sm text-red-600">{errors.weight.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Departamento *</Label>
            <Input
              id="department"
              {...register("department")}
            />
            {errors.department && (
              <p className="text-sm text-red-600">{errors.department.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Registrar Residuo
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
