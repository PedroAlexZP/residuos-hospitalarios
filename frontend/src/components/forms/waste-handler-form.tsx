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
import { useCreateWasteHandler, useUpdateWasteHandler } from "@/lib/queries";
import type { WasteHandler } from "@/lib/types";

const wasteHandlerSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  certification: z.string().min(1, "La certificación es requerida"),
  contact_info: z.string().min(1, "La información de contacto es requerida"),
  role: z.string().optional(),
});

interface WasteHandlerFormProps {
  wasteHandler?: WasteHandler;
  onSuccess?: () => void;
}

export function WasteHandlerForm({
  wasteHandler,
  onSuccess,
}: WasteHandlerFormProps) {
  const createMutation = useCreateWasteHandler();
  const updateMutation = useUpdateWasteHandler();

  const isEditing = !!wasteHandler;

  const form = useForm({
    defaultValues: {
      name: wasteHandler?.name || "",
      certification: wasteHandler?.certification || "",
      contact_info: wasteHandler?.contact_info || "",
      role: wasteHandler?.role || "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditing) {
          await updateMutation.mutateAsync({
            id: wasteHandler.id,
            data: value,
          });
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
          {isEditing ? "Editar Operador" : "Registrar Operador"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica la información del operador"
            : "Completa la información para registrar un nuevo operador"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="name"
              validators={{
                onChange: wasteHandlerSchema.shape.name,
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
                    placeholder="Ej: EcoWaste Solutions"
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
              name="role"
              validators={{
                onChange: wasteHandlerSchema.shape.role,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Rol</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: Transportista, Tratador, Disposición Final"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="certification"
            validators={{
              onChange: wasteHandlerSchema.shape.certification,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Certificación *</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Número de certificación o licencia"
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
            name="contact_info"
            validators={{
              onChange: wasteHandlerSchema.shape.contact_info,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Información de Contacto *</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Teléfono, email, dirección, persona de contacto..."
                  rows={4}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">
                    {field.state.meta.errors[0]?.message}
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
              {isLoading
                ? "Guardando..."
                : isEditing
                ? "Actualizar"
                : "Registrar"}
            </Button>
          </div>
        </form>
=======
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WasteHandlerFormProps {
  onSuccess?: () => void
}

export function WasteHandlerForm({ onSuccess }: WasteHandlerFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manejador de Residuos</CardTitle>
        <CardDescription>Formulario en desarrollo</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Formulario en desarrollo...</p>
        <Button onClick={onSuccess} className="mt-4">
          Guardar
        </Button>
>>>>>>> 73da3e6f58d7b198fec3cea8715ed2f9f24db4f1
      </CardContent>
    </Card>
  );
}
