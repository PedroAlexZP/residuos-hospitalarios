import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as api from "./api"
import type {
  DepartmentAttribute,
  MedicalWaste,
  WasteAudit,
  WasteCategory,
  WasteContainer,
  WasteCollection,
  WasteDisposal,
  WasteHandler,
} from "./types"

// Query keys actualizados
export const queryKeys = {
  departments: ["department-attributes"] as const,
  department: (id: string) => ["department-attributes", id] as const,
  medicalWastes: ["medical-wastes"] as const,
  medicalWaste: (id: string) => ["medical-wastes", id] as const,
  wasteCategories: ["waste-categories"] as const,
  wasteCategory: (id: string) => ["waste-categories", id] as const,
  wasteContainers: ["waste-containers"] as const,
  wasteContainer: (id: string) => ["waste-containers", id] as const,
  wasteCollections: ["waste-collections"] as const,
  wasteCollection: (id: string) => ["waste-collections", id] as const,
  wasteHandlers: ["waste-handlers"] as const,
  wasteHandler: (id: string) => ["waste-handlers", id] as const,
  wasteDisposals: ["waste-disposals"] as const,
  wasteDisposal: (id: string) => ["waste-disposals", id] as const,
  wasteAudits: ["waste-audits"] as const,
  wasteAudit: (id: string) => ["waste-audits", id] as const,
}

// Department queries
export const useDepartments = () => {
  return useQuery({
    queryKey: queryKeys.departments,
    queryFn: () => api.getEntities<DepartmentAttribute>("/department-attributes"),
  })
}

export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: queryKeys.department(id),
    queryFn: () => api.getEntity<DepartmentAttribute>("/department-attributes", id),
    enabled: !!id,
  })
}

export const useCreateDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<DepartmentAttribute>) =>
      api.createEntity<DepartmentAttribute>("/department-attributes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments })
      toast.success("Departamento creado exitosamente")
    },
    onError: (error) => {
      toast.error("Error al crear departamento: " + error.message)
    },
  })
}

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DepartmentAttribute> }) =>
      api.updateEntity<DepartmentAttribute>("/department-attributes", id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments })
      queryClient.invalidateQueries({ queryKey: queryKeys.department(id) })
      toast.success("Departamento actualizado exitosamente")
    },
    onError: (error) => {
      toast.error("Error al actualizar departamento: " + error.message)
    },
  })
}

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteEntity("/department-attributes", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments })
      toast.success("Departamento eliminado exitosamente")
    },
    onError: (error) => {
      toast.error("Error al eliminar departamento: " + error.message)
    },
  })
}

// Medical Waste queries
export const useMedicalWastes = () => {
  return useQuery({
    queryKey: queryKeys.medicalWastes,
    queryFn: () => api.getEntities<MedicalWaste>("/medical-wastes"),
  })
}

export const useMedicalWaste = (id: string) => {
  return useQuery({
    queryKey: queryKeys.medicalWaste(id),
    queryFn: () => api.getEntity<MedicalWaste>("/medical-wastes", id),
    enabled: !!id,
  })
}

export const useCreateMedicalWaste = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<MedicalWaste>) => api.createEntity<MedicalWaste>("/medical-wastes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalWastes })
      toast.success("Residuo médico registrado exitosamente")
    },
    onError: (error) => {
      toast.error("Error al registrar residuo médico: " + error.message)
    },
  })
}

export const useUpdateMedicalWaste = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MedicalWaste> }) =>
      api.updateEntity<MedicalWaste>("/medical-wastes", id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalWastes })
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalWaste(id) })
      toast.success("Residuo médico actualizado exitosamente")
    },
    onError: (error) => {
      toast.error("Error al actualizar residuo médico: " + error.message)
    },
  })
}

export const useDeleteMedicalWaste = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteEntity("/medical-wastes", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalWastes })
      toast.success("Residuo médico eliminado exitosamente")
    },
    onError: (error) => {
      toast.error("Error al eliminar residuo médico: " + error.message)
    },
  })
}

// Waste Categories queries
export const useWasteCategories = () => {
  return useQuery({
    queryKey: queryKeys.wasteCategories,
    queryFn: () => api.getEntities<WasteCategory>("/waste-categories"),
  })
}

export const useWasteCategory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.wasteCategory(id),
    queryFn: () => api.getEntity<WasteCategory>("/waste-categories", id),
    enabled: !!id,
  })
}

export const useCreateWasteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<WasteCategory>) => api.createEntity<WasteCategory>("/waste-categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteCategories })
      toast.success("Categoría de residuo creada exitosamente")
    },
    onError: (error) => {
      toast.error("Error al crear categoría: " + error.message)
    },
  })
}

export const useUpdateWasteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WasteCategory> }) =>
      api.updateEntity<WasteCategory>("/waste-categories", id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteCategories })
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteCategory(id) })
      toast.success("Categoría actualizada exitosamente")
    },
    onError: (error) => {
      toast.error("Error al actualizar categoría: " + error.message)
    },
  })
}

export const useDeleteWasteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteEntity("/waste-categories", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteCategories })
      toast.success("Categoría eliminada exitosamente")
    },
    onError: (error) => {
      toast.error("Error al eliminar categoría: " + error.message)
    },
  })
}

// Waste Containers queries
export const useWasteContainers = () => {
  return useQuery({
    queryKey: queryKeys.wasteContainers,
    queryFn: () => api.getEntities<WasteContainer>("/waste-containers"),
  })
}

export const useWasteContainer = (id: string) => {
  return useQuery({
    queryKey: queryKeys.wasteContainer(id),
    queryFn: () => api.getEntity<WasteContainer>("/waste-containers", id),
    enabled: !!id,
  })
}

export const useCreateWasteContainer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<WasteContainer>) => api.createEntity<WasteContainer>("/waste-containers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteContainers })
      toast.success("Contenedor creado exitosamente")
    },
    onError: (error) => {
      toast.error("Error al crear contenedor: " + error.message)
    },
  })
}

export const useUpdateWasteContainer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WasteContainer> }) =>
      api.updateEntity<WasteContainer>("/waste-containers", id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteContainers })
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteContainer(id) })
      toast.success("Contenedor actualizado exitosamente")
    },
    onError: (error) => {
      toast.error("Error al actualizar contenedor: " + error.message)
    },
  })
}

export const useDeleteWasteContainer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteEntity("/waste-containers", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteContainers })
      toast.success("Contenedor eliminado exitosamente")
    },
    onError: (error) => {
      toast.error("Error al eliminar contenedor: " + error.message)
    },
  })
}

// Waste Collections queries
export const useWasteCollections = () => {
  return useQuery({
    queryKey: queryKeys.wasteCollections,
    queryFn: () => api.getEntities<WasteCollection>("/waste-collections"),
  })
}

export const useWasteCollection = (id: string) => {
  return useQuery({
    queryKey: queryKeys.wasteCollection(id),
    queryFn: () => api.getEntity<WasteCollection>("/waste-collections", id),
    enabled: !!id,
  })
}

export const useCreateWasteCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<WasteCollection>) => api.createEntity<WasteCollection>("/waste-collections", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteCollections })
      toast.success("Recolección registrada exitosamente")
    },
    onError: (error) => {
      toast.error("Error al registrar recolección: " + error.message)
    },
  })
}

export const useUpdateWasteCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WasteCollection> }) =>
      api.updateEntity<WasteCollection>("/waste-collections", id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteCollections })
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteCollection(id) })
      toast.success("Recolección actualizada exitosamente")
    },
    onError: (error) => {
      toast.error("Error al actualizar recolección: " + error.message)
    },
  })
}

export const useDeleteWasteCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteEntity("/waste-collections", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteCollections })
      toast.success("Recolección eliminada exitosamente")
    },
    onError: (error) => {
      toast.error("Error al eliminar recolección: " + error.message)
    },
  })
}

// Waste Handlers queries
export const useWasteHandlers = () => {
  return useQuery({
    queryKey: queryKeys.wasteHandlers,
    queryFn: () => api.getEntities<WasteHandler>("/waste-handlers"),
  })
}

export const useWasteHandler = (id: string) => {
  return useQuery({
    queryKey: queryKeys.wasteHandler(id),
    queryFn: () => api.getEntity<WasteHandler>("/waste-handlers", id),
    enabled: !!id,
  })
}

export const useCreateWasteHandler = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<WasteHandler>) => api.createEntity<WasteHandler>("/waste-handlers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteHandlers })
      toast.success("Operador registrado exitosamente")
    },
    onError: (error) => {
      toast.error("Error al registrar operador: " + error.message)
    },
  })
}

export const useUpdateWasteHandler = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WasteHandler> }) =>
      api.updateEntity<WasteHandler>("/waste-handlers", id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteHandlers })
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteHandler(id) })
      toast.success("Operador actualizado exitosamente")
    },
    onError: (error) => {
      toast.error("Error al actualizar operador: " + error.message)
    },
  })
}

export const useDeleteWasteHandler = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteEntity("/waste-handlers", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteHandlers })
      toast.success("Operador eliminado exitosamente")
    },
    onError: (error) => {
      toast.error("Error al eliminar operador: " + error.message)
    },
  })
}

// Waste Disposals queries
export const useWasteDisposals = () => {
  return useQuery({
    queryKey: queryKeys.wasteDisposals,
    queryFn: () => api.getEntities<WasteDisposal>("/waste-disposals"),
  })
}

export const useWasteDisposal = (id: string) => {
  return useQuery({
    queryKey: queryKeys.wasteDisposal(id),
    queryFn: () => api.getEntity<WasteDisposal>("/waste-disposals", id),
    enabled: !!id,
  })
}

export const useCreateWasteDisposal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<WasteDisposal>) => api.createEntity<WasteDisposal>("/waste-disposals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteDisposals })
      toast.success("Disposición registrada exitosamente")
    },
    onError: (error) => {
      toast.error("Error al registrar disposición: " + error.message)
    },
  })
}

export const useUpdateWasteDisposal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WasteDisposal> }) =>
      api.updateEntity<WasteDisposal>("/waste-disposals", id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteDisposals })
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteDisposal(id) })
      toast.success("Disposición actualizada exitosamente")
    },
    onError: (error) => {
      toast.error("Error al actualizar disposición: " + error.message)
    },
  })
}

export const useDeleteWasteDisposal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteEntity("/waste-disposals", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteDisposals })
      toast.success("Disposición eliminada exitosamente")
    },
    onError: (error) => {
      toast.error("Error al eliminar disposición: " + error.message)
    },
  })
}

// Waste Audits queries
export const useWasteAudits = () => {
  return useQuery({
    queryKey: queryKeys.wasteAudits,
    queryFn: () => api.getEntities<WasteAudit>("/waste-audits"),
  })
}

export const useWasteAudit = (id: string) => {
  return useQuery({
    queryKey: queryKeys.wasteAudit(id),
    queryFn: () => api.getEntity<WasteAudit>("/waste-audits", id),
    enabled: !!id,
  })
}

export const useCreateWasteAudit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<WasteAudit>) => api.createEntity<WasteAudit>("/waste-audits", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteAudits })
      toast.success("Auditoría creada exitosamente")
    },
    onError: (error) => {
      toast.error("Error al crear auditoría: " + error.message)
    },
  })
}

export const useUpdateWasteAudit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WasteAudit> }) =>
      api.updateEntity<WasteAudit>("/waste-audits", id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteAudits })
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteAudit(id) })
      toast.success("Auditoría actualizada exitosamente")
    },
    onError: (error) => {
      toast.error("Error al actualizar auditoría: " + error.message)
    },
  })
}

export const useDeleteWasteAudit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteEntity("/waste-audits", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wasteAudits })
      toast.success("Auditoría eliminada exitosamente")
    },
    onError: (error) => {
      toast.error("Error al eliminar auditoría: " + error.message)
    },
  })
}
