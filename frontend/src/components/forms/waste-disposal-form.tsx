"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WasteDisposalFormProps {
  onSuccess?: () => void
}

export function WasteDisposalForm({ onSuccess }: WasteDisposalFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Disposición de Residuos</CardTitle>
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
=======
        <p>Formulario en desarrollo...</p>
        <Button onClick={onSuccess} className="mt-4">
          Guardar
        </Button>
>>>>>>> 73da3e6f58d7b198fec3cea8715ed2f9f24db4f1
      </CardContent>
    </Card>
  )
}
