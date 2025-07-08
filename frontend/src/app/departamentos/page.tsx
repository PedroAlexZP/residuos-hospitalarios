"use client"

import { useState } from "react"
import { Plus, Eye, Edit, Trash2, Building } from "lucide-react"
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
import { DepartmentForm } from "@/components/forms/department-form"
import { useDepartments, useDeleteDepartment } from "@/lib/queries"
import type { DepartmentAttribute } from "@/lib/types"
import type { ColumnDef } from "@tanstack/react-table"

export default function DepartmentsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<DepartmentAttribute | null>(null)

  const { data: departments = [], isLoading, error } = useDepartments()
  const deleteMutation = useDeleteDepartment()

  const columns: ColumnDef<DepartmentAttribute>[] = [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "responsiblePerson",
      header: "Responsable",
    },
    {
      accessorKey: "location",
      header: "Ubicación",
    },
    {
      accessorKey: "contactEmail",
      header: "Email",
      cell: ({ row }) => (
        <a href={`mailto:${row.getValue("contactEmail")}`} className="text-blue-600 hover:underline">
          {row.getValue("contactEmail")}
        </a>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.getValue<boolean>("isActive")
        return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Activo" : "Inactivo"}</Badge>
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const department = row.original
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingDepartment(department)}>
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
                  <AlertDialogTitle>¿Eliminar departamento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El departamento será eliminado permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate(department.id)}
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
            <p className="mt-2 text-muted-foreground">Cargando departamentos...</p>
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
            <p className="text-red-600">Error al cargar los departamentos</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Departamentos</h1>
          <p className="text-muted-foreground">Administra los departamentos generadores de residuos médicos</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Departamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Departamento</DialogTitle>
            </DialogHeader>
            <DepartmentForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={departments} searchKey="name" searchPlaceholder="Buscar departamentos..." />

      {/* Edit Dialog */}
      <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Departamento</DialogTitle>
          </DialogHeader>
          {editingDepartment && (
            <DepartmentForm department={editingDepartment} onSuccess={() => setEditingDepartment(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
