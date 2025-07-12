"use client";

<<<<<<< HEAD
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateDepartment, useUpdateDepartment } from "@/lib/queries";
import type { DepartmentAttribute } from "@/lib/types";
=======
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
>>>>>>> 73da3e6f58d7b198fec3cea8715ed2f9f24db4f1

const departmentSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  location: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>

interface DepartmentFormProps {
  department?: DepartmentAttribute;
  onSuccess?: () => void;
}

export function DepartmentForm({ department, onSuccess }: DepartmentFormProps) {
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const isEditing = !!department;

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
<<<<<<< HEAD
    onSubmit: async ({ value }) => {
      try {
        if (isEditing) {
          await updateMutation.mutateAsync({ id: department.id, data: value });
        } else {
          await createMutation.mutateAsync(value);
        }
        onSuccess?.();
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
    validatorAdapter: zodValidator(),
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;
=======
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
>>>>>>> 73da3e6f58d7b198fec3cea8715ed2f9f24db4f1

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Departamento" : "Crear Departamento"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica la información del departamento"
            : "Completa la información para crear un nuevo departamento"}
        </CardDescription>
      </CardHeader>
      <CardContent>
<<<<<<< HEAD
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field
            name="name"
            validators={{
              onChange: departmentSchema.shape.name,
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
                  placeholder="Ej: Cirugía General"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
=======
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
>>>>>>> 73da3e6f58d7b198fec3cea8715ed2f9f24db4f1
            )}
          </div>

<<<<<<< HEAD
          <form.Field
            name="location"
            validators={{
              onChange: departmentSchema.shape.location,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Ubicación</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Descripción de la ubicación del departamento..."
                  rows={3}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
=======
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
>>>>>>> 73da3e6f58d7b198fec3cea8715ed2f9f24db4f1
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess?.()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
