/**
 * Hooks personalizados para el módulo de residuos
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wasteService } from '../services/waste.service'
import type {
  MedicalWaste,
  WasteCategory,
  WasteContainer,
  CreateWasteRequest,
  UpdateWasteRequest,
  CreateCategoryRequest,
  CreateContainerRequest,
  WasteFilters,
  WasteStats
} from '../types'
import { toast } from 'sonner'

// Query keys
export const wasteKeys = {
  all: ['wastes'] as const,
  wastes: (filters?: WasteFilters) => [...wasteKeys.all, 'list', filters] as const,
  waste: (id: string) => [...wasteKeys.all, 'detail', id] as const,
  categories: () => [...wasteKeys.all, 'categories'] as const,
  category: (id: string) => [...wasteKeys.all, 'category', id] as const,
  containers: (departmentId?: string) => [...wasteKeys.all, 'containers', departmentId] as const,
  container: (id: string) => [...wasteKeys.all, 'container', id] as const,
  stats: (filters?: WasteFilters) => [...wasteKeys.all, 'stats', filters] as const,
  search: (query: string) => [...wasteKeys.all, 'search', query] as const,
}

// Hooks para residuos médicos
export function useWastes(
  page: number = 1,
  limit: number = 10,
  filters?: WasteFilters
) {
  return useQuery({
    queryKey: wasteKeys.wastes(filters),
    queryFn: () => wasteService.getMedicalWastes(page, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export function useWaste(id: string) {
  return useQuery({
    queryKey: wasteKeys.waste(id),
    queryFn: () => wasteService.getMedicalWaste(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateWaste() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWasteRequest) => wasteService.createMedicalWaste(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wasteKeys.all })
      toast.success('Residuo creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el residuo')
    },
  })
}

export function useUpdateWaste() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWasteRequest }) =>
      wasteService.updateMedicalWaste(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: wasteKeys.waste(id) })
      queryClient.invalidateQueries({ queryKey: wasteKeys.all })
      toast.success('Residuo actualizado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el residuo')
    },
  })
}

export function useDeleteWaste() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => wasteService.deleteMedicalWaste(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wasteKeys.all })
      toast.success('Residuo eliminado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el residuo')
    },
  })
}

// Hooks para categorías
export function useWasteCategories() {
  return useQuery({
    queryKey: wasteKeys.categories(),
    queryFn: () => wasteService.getWasteCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  })
}

export function useWasteCategory(id: string) {
  return useQuery({
    queryKey: wasteKeys.category(id),
    queryFn: () => wasteService.getWasteCategory(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  })
}

export function useCreateWasteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => wasteService.createWasteCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wasteKeys.categories() })
      toast.success('Categoría creada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear la categoría')
    },
  })
}

// Hooks para contenedores
export function useWasteContainers(departmentId?: string) {
  return useQuery({
    queryKey: wasteKeys.containers(departmentId),
    queryFn: () => wasteService.getWasteContainers(departmentId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useWasteContainer(id: string) {
  return useQuery({
    queryKey: wasteKeys.container(id),
    queryFn: () => wasteService.getWasteContainer(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateWasteContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContainerRequest) => wasteService.createWasteContainer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wasteKeys.containers() })
      toast.success('Contenedor creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el contenedor')
    },
  })
}

export function useUpdateContainerStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WasteContainer['status'] }) =>
      wasteService.updateContainerStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: wasteKeys.container(id) })
      queryClient.invalidateQueries({ queryKey: wasteKeys.containers() })
      toast.success('Estado del contenedor actualizado')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el estado')
    },
  })
}

// Hooks para estadísticas
export function useWasteStats(filters?: WasteFilters) {
  return useQuery({
    queryKey: wasteKeys.stats(filters),
    queryFn: () => wasteService.getWasteStats(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para búsqueda
export function useSearchWastes(query: string) {
  return useQuery({
    queryKey: wasteKeys.search(query),
    queryFn: () => wasteService.searchWastes(query),
    enabled: query.length >= 3,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}
