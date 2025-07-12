"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WasteCategory } from "@/lib/types"

interface WasteCategoryFormProps {
  wasteCategory?: WasteCategory
  onSuccess?: () => void
}

export function WasteCategoryForm({ wasteCategory, onSuccess }: WasteCategoryFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{wasteCategory ? 'Editar' : 'Crear'} Categoría de Residuos</CardTitle>
        <CardDescription>Formulario en desarrollo</CardDescription>
      </CardHeader>
      <CardContent>
<<<<<<< HEAD
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
                  <p className="text-sm text-red-600">{field.state.meta.errors[0]?.message}</p>
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
                  <p className="text-sm text-red-600">{field.state.meta.errors[0]?.message}</p>
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
                  <p className="text-sm text-red-600">{field.state.meta.errors[0]?.message}</p>
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
              {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
=======
        <p>Formulario en desarrollo...</p>
        {wasteCategory && <p>Editando: {wasteCategory.name}</p>}
        <Button onClick={onSuccess} className="mt-4">
          Guardar
        </Button>
>>>>>>> 73da3e6f58d7b198fec3cea8715ed2f9f24db4f1
      </CardContent>
    </Card>
  )
}
