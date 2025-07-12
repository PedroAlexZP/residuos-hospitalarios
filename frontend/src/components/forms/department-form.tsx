"use client";

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

const departmentSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  location: z.string().optional(),
});

interface DepartmentFormProps {
  department?: DepartmentAttribute;
  onSuccess?: () => void;
}

export function DepartmentForm({ department, onSuccess }: DepartmentFormProps) {
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const isEditing = !!department;

  const form = useForm({
    defaultValues: {
      name: department?.name || "",
      location: department?.location || "",
    },
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
            )}
          </form.Field>

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
            )}
          </form.Field>

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
