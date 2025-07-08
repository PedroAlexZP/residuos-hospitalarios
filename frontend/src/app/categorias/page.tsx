"use client"

import { useState } from "react"
import { Plus, Eye, Edit, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { WasteCategoryForm } from "@/components/forms/waste-category-form"
import { useWasteCategories, useDeleteWasteCategory } from "@/lib/queries"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { WasteCategory } from "@/lib/types"
import type { ColumnDef } from "@tanstack/react-table"

export default function WasteCategoriesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<WasteCategory | null>(null)

  const { data: categories = [], isLoading, error } = useWasteCategories()
  const deleteMutation = useDeleteWasteCategory()

  const columns: ColumnDef<WasteCategory>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "hazard_level",
      header: "Nivel de Peligro",
      cell: ({ row }) => {
        const level = row.getValue<string>("hazard_level")
        return level || <span className="text-muted-foreground">No especificado</span>
      },
    },
    {
      accessorKey: "handling_protocol",
      header: "Protocolo de Manejo",
      cell: ({ row }) => {
        const protocol = row.getValue<string>("handling_protocol")
        return (
          <div className="max-w-xs truncate" title={protocol}>
            {protocol}
          </div>
        )
      },
    },
    {
      accessorKey: "disposal_method",
      header: "Método de Disposición",
      cell: ({ row }) => {
        const method = row.getValue<string>("disposal_method")
        return (
          <div className="max-w-xs truncate" title={method}>
            {method}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const category = row.original
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingCategory(category)}>
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
                  <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. La categoría será eliminada permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate(category.id)}
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
            <p className="mt-2 text-muted-foreground">Cargando categorías...</p>
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
            <p className="text-red-600">Error al cargar las categorías</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Categorías de Residuos</h1>
            <p className="text-muted-foreground">Gestiona las categorías y clasificaciones de residuos médicos</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Categoría</DialogTitle>
              </DialogHeader>
              <WasteCategoryForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <DataTable columns={columns} data={categories} searchKey="name" searchPlaceholder="Buscar categorías..." />

        {/* Edit Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <WasteCategoryForm wasteCategory={editingCategory} onSuccess={() => setEditingCategory(null)} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
