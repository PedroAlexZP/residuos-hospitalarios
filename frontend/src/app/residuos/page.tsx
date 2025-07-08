"use client"

import { useState } from "react"
import { Plus, Eye, Edit, Trash2, Calendar } from "lucide-react"
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
import { MedicalWasteForm } from "@/components/forms/medical-waste-form"
import { useMedicalWastes, useDeleteMedicalWaste } from "@/lib/queries"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { PERMISSIONS } from "@/lib/auth"
import type { MedicalWaste } from "@/lib/types"
import type { ColumnDef } from "@tanstack/react-table"

export default function MedicalWastePage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingWaste, setEditingWaste] = useState<MedicalWaste | null>(null)

  const { data: medicalWastes = [], isLoading, error } = useMedicalWastes()
  const deleteMutation = useDeleteMedicalWaste()

  const columns: ColumnDef<MedicalWaste>[] = [
    {
      accessorKey: "generation_date",
      header: "Fecha de Generación",
      cell: ({ row }) => {
        const date = new Date(row.getValue<string>("generation_date"))
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{date.toLocaleDateString("es-ES")}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "weight",
      header: "Peso",
      cell: ({ row }) => <div className="font-mono">{row.getValue<string>("weight")}</div>,
    },
    {
      accessorKey: "department",
      header: "Departamento",
      cell: ({ row }) => {
        const department = row.original.department
        return department?.name || "Sin departamento"
      },
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => {
        const description = row.getValue<string>("description")
        return description ? (
          <div className="max-w-xs truncate" title={description}>
            {description}
          </div>
        ) : (
          <span className="text-muted-foreground">Sin descripción</span>
        )
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const waste = row.original
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingWaste(waste)}>
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
                  <AlertDialogTitle>¿Eliminar residuo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El residuo será eliminado permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate(waste.id)}
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
            <p className="mt-2 text-muted-foreground">Cargando residuos médicos...</p>
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
            <p className="text-red-600">Error al cargar los residuos médicos</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredPermissions={[PERMISSIONS.VIEW_WASTE]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registro de Residuos Médicos</h1>
            <p className="text-muted-foreground">
              Gestiona el registro y seguimiento de residuos médicos hospitalarios
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Residuo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Residuo Médico</DialogTitle>
              </DialogHeader>
              <MedicalWasteForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <DataTable columns={columns} data={medicalWastes} searchKey="weight" searchPlaceholder="Buscar por peso..." />

        {/* Edit Dialog */}
        <Dialog open={!!editingWaste} onOpenChange={() => setEditingWaste(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Residuo Médico</DialogTitle>
            </DialogHeader>
            {editingWaste && <MedicalWasteForm medicalWaste={editingWaste} onSuccess={() => setEditingWaste(null)} />}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
