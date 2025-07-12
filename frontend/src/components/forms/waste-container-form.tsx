"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WasteContainer } from "@/lib/types"

interface WasteContainerFormProps {
  wasteContainer?: WasteContainer
  onSuccess?: () => void
}

export function WasteContainerForm({ wasteContainer, onSuccess }: WasteContainerFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{wasteContainer ? 'Editar' : 'Crear'} Contenedor de Residuos</CardTitle>
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
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]?.message}</p>
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
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]?.message}</p>
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
                  <p className="text-sm text-red-600">{field.state.meta.errors[0]?.message}</p>
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
        {wasteContainer && <p>Editando contenedor en: {wasteContainer.location}</p>}
        <Button onClick={onSuccess} className="mt-4">
          Guardar
        </Button>
>>>>>>> 73da3e6f58d7b198fec3cea8715ed2f9f24db4f1
      </CardContent>
    </Card>
  )
}
