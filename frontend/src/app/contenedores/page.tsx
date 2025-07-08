"use client"

import { useState } from "react"
import { Plus, Eye, Edit, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { WasteContainerForm } from "@/components/forms/waste-container-form"
import { useWasteContainers, useDeleteWasteContainer } from "@/lib/queries"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { WasteContainer } from "@/lib/types"
import type { ColumnDef } from "@tanstack/react-table"

export default function WasteContainersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingContainer, setEditingContainer] = useState<WasteContainer | null>(null)

  const { data: containers = [], isLoading, error } = useWasteContainers()
  const deleteMutation = useDeleteWasteContainer()

  const getStatusColor = (status: string) => {
    const colors = {
      empty: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      partial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      full: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      sealed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      collected: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    }
    return colors[status as keyof typeof colors] || colors.empty
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      empty: "Vacío",
      partial: "Parcial",
      full: "Lleno",
      sealed: "Sellado",
      collected: "Recolectado",
    }
    return labels[status as keyof typeof labels] || status
  }

  const columns: ColumnDef<WasteContainer>[] = [
    {
      accessorKey: "capacity",
      header: "Capacidad (L)",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono">{row.getValue<number>("capacity")} L</span>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Ubicación",
      cell: ({ row }) => {
        const location = row.getValue<string>("location")
        return (
          <div className="max-w-xs truncate" title={location}>
            {location}
          </div>
        )
      },
    },
    {
      accessorKey: "status_name",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue<string>("status_name")
        return status ? (
          <Badge className={getStatusColor(status)}>{getStatusLabel(status)}</Badge>
        ) : (
          <span className="text-muted-foreground">Sin estado</span>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => {
        const category = row.original.category
        return category?.name || <span className="text-muted-foreground">Sin categoría</span>
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const container = row.original
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingContainer(container)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar contenedor?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El contenedor será eliminado permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate(container.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando contenedores...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error al cargar los contenedores</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRoles={["administrador", "supervisor"]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contenedores de Residuos</h1>
            <p className="text-muted-foreground">Gestiona los contenedores para almacenamiento de residuos médicos</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear Contenedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Contenedor</DialogTitle>
              </DialogHeader>
              <WasteContainerForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <DataTable
          columns={columns}
          data={containers}
          searchKey="location"
          searchPlaceholder="Buscar por ubicación..."
        />

        {/* Edit Dialog */}
        <Dialog open={!!editingContainer} onOpenChange={() => setEditingContainer(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Contenedor</DialogTitle>
            </DialogHeader>
            {editingContainer && (
              <WasteContainerForm wasteContainer={editingContainer} onSuccess={() => setEditingContainer(null)} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
