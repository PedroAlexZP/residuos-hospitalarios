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
import { useCreateWasteAudit, useUpdateWasteAudit, useDepartments } from "@/lib/queries"
import type { WasteAudit } from "@/lib/types"

const wasteAuditSchema = z.object({
  audit_date: z.string().min(1, "La fecha de auditoría es requerida"),
  auditor: z.string().min(1, "El auditor es requerido"),
  compliance_score: z.number().min(0, "El puntaje debe ser mayor o igual a 0").max(100, "El puntaje máximo es 100"),
  findings: z.string().optional(),
  department: z.string().optional(),
})

interface WasteAuditFormProps {
  wasteAudit?: WasteAudit
  onSuccess?: () => void
}

export function WasteAuditForm({ wasteAudit, onSuccess }: WasteAuditFormProps) {
  const createMutation = useCreateWasteAudit()
  const updateMutation = useUpdateWasteAudit()
  const { data: departments = [] } = useDepartments()

  const isEditing = !!wasteAudit

  const form = useForm({
    defaultValues: {
      audit_date: wasteAudit?.audit_date ? wasteAudit.audit_date.split("T")[0] : "",
      auditor: wasteAudit?.auditor || "",
      compliance_score: wasteAudit?.compliance_score || 0,
      findings: wasteAudit?.findings || "",
      department: wasteAudit?.department?.id || "",
    },
    onSubmit: async ({ value }) => {
      try {
        const submitData = {
          ...value,
          department: value.department || undefined,
        }

        if (isEditing) {
          await updateMutation.mutateAsync({ id: wasteAudit.id, data: submitData })
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
        <CardTitle>{isEditing ? "Editar Auditoría" : "Registrar Auditoría"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica la información de la auditoría"
            : "Completa la información para registrar una nueva auditoría"}
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
              name="audit_date"
              validators={{
                onChange: wasteAuditSchema.shape.audit_date,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Fecha de Auditoría *</Label>
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
              name="compliance_score"
              validators={{
                onChange: wasteAuditSchema.shape.compliance_score,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Puntaje de Cumplimiento *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="0"
                    max="100"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number.parseInt(e.target.value) || 0)}
                    placeholder="0-100"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="auditor"
              validators={{
                onChange: wasteAuditSchema.shape.auditor,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Auditor *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Nombre del auditor"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="department"
              validators={{
                onChange: wasteAuditSchema.shape.department,
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
          </div>

          <form.Field
            name="findings"
            validators={{
              onChange: wasteAuditSchema.shape.findings,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Hallazgos</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe los hallazgos de la auditoría..."
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
