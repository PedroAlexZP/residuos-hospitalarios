/**
 * Formulario para crear residuos médicos
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useCreateWaste, useWasteCategories } from '../hooks/use-waste'
// import { useDepartments } from '../../departments/hooks/use-departments'
import { formatDate, validateRequired, validateNumberRange } from '@/shared/utils'
import type { CreateWasteRequest } from '../types'

// Mock data temporal hasta crear el hook de departamentos
const mockDepartments = [
  { id: '1', name: 'Cirugía' },
  { id: '2', name: 'Urgencias' },
  { id: '3', name: 'Laboratorio' },
]

const wasteSchema = z.object({
  generation_date: z.string().min(1, 'La fecha es obligatoria'),
  weight: z.number().min(0.01, 'El peso debe ser mayor a 0').max(1000, 'El peso no puede exceder 1000kg'),
  description: z.string().optional(),
  department_id: z.string().min(1, 'El departamento es obligatorio'),
  category_id: z.string().min(1, 'La categoría es obligatoria'),
  generator_name: z.string().min(1, 'El nombre del generador es obligatorio'),
})

type WasteFormData = z.infer<typeof wasteSchema>

interface WasteFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function WasteForm({ onSuccess, onCancel }: WasteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: categories = [] } = useWasteCategories()
  // const { data: departments = [] } = useDepartments()
  const departments = mockDepartments
  const createWaste = useCreateWaste()

  const form = useForm<WasteFormData>({
    resolver: zodResolver(wasteSchema),
    defaultValues: {
      generation_date: formatDate(new Date(), 'en-CA'), // YYYY-MM-DD format
      weight: 0,
      description: '',
      department_id: '',
      category_id: '',
      generator_name: '',
    },
  })

  const onSubmit = async (data: WasteFormData) => {
    setIsSubmitting(true)
    try {
      await createWaste.mutateAsync({
        ...data,
        weight: Number(data.weight),
      })
      
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Error creating waste:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Residuo Médico</CardTitle>
        <CardDescription>
          Complete la información para registrar un nuevo residuo médico en el sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="generation_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Generación</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="generator_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Generador</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo del responsable" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría de Residuo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción adicional del residuo..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrar Residuo'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
