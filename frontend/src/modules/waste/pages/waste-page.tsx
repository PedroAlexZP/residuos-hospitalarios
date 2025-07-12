/**
 * Página de residuos utilizando arquitectura modular
 */

'use client'

import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

import { WasteForm } from '../components/waste-form'
import { useWastes, useWasteStats } from '../hooks/use-waste'
import { formatDate, formatWeight } from '@/shared/utils'
import { WASTE_STATUS, STATUS_COLORS } from '@/shared/constants'
import type { WasteFilters } from '../types'

export function WastePage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<WasteFilters>({})

  const { data: wastesResponse, isLoading } = useWastes(1, 10, filters)
  const { data: stats } = useWasteStats(filters)

  const wastes = wastesResponse?.data || []

  const handleFormSuccess = () => {
    setIsFormOpen(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Residuos</h1>
          <p className="text-muted-foreground">
            Administra y rastrea los residuos médicos del hospital
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Residuo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <WasteForm 
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Residuos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_count}</div>
              <p className="text-xs text-muted-foreground">
                {formatWeight(stats.total_weight)} total
              </p>
            </CardContent>
          </Card>

          {stats.by_status.map((statusStat) => (
            <Card key={statusStat.status}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {statusStat.status.replace('_', ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusStat.count}</div>
                <Badge variant="secondary" className={STATUS_COLORS[statusStat.status]}>
                  {statusStat.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar residuos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de residuos */}
      <Card>
        <CardHeader>
          <CardTitle>Residuos Registrados</CardTitle>
          <CardDescription>
            Lista de todos los residuos médicos en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando residuos...</div>
          ) : wastes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay residuos registrados
            </div>
          ) : (
            <div className="space-y-4">
              {wastes.map((waste) => (
                <div
                  key={waste.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={STATUS_COLORS[waste.status]}
                        >
                          {waste.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(waste.generation_date)}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">
                          {waste.category?.name || 'Sin categoría'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Generado por: {waste.generator_name}
                        </p>
                        {waste.description && (
                          <p className="text-sm mt-1">{waste.description}</p>
                        )}
                      </div>

                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Peso: {formatWeight(waste.weight)}</span>
                        <span>Departamento: {waste.department?.name || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
