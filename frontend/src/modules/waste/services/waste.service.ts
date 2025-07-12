/**
 * Servicio para manejo de residuos médicos
 */

import { BaseApiClient } from '@/shared/services/base-api'
import { PaginatedResponse } from '@/shared/types'
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

export class WasteService extends BaseApiClient {
  private static instance: WasteService

  static getInstance(): WasteService {
    if (!WasteService.instance) {
      WasteService.instance = new WasteService()
    }
    return WasteService.instance
  }

  // Gestión de residuos médicos
  async getMedicalWastes(
    page: number = 1,
    limit: number = 10,
    filters?: WasteFilters
  ): Promise<PaginatedResponse<MedicalWaste>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      populate: 'deep',
    })

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(`filters[${key}]`, value)
      })
    }

    return this.get<PaginatedResponse<MedicalWaste>>(`/medical-wastes?${params}`)
  }

  async getMedicalWaste(id: string): Promise<MedicalWaste> {
    return this.get<MedicalWaste>(`/medical-wastes/${id}?populate=deep`)
  }

  async createMedicalWaste(data: CreateWasteRequest): Promise<MedicalWaste> {
    return this.post<MedicalWaste>('/medical-wastes', { data })
  }

  async updateMedicalWaste(id: string, data: UpdateWasteRequest): Promise<MedicalWaste> {
    return this.put<MedicalWaste>(`/medical-wastes/${id}`, { data })
  }

  async deleteMedicalWaste(id: string): Promise<void> {
    await this.delete(`/medical-wastes/${id}`)
  }

  async getWasteStats(filters?: WasteFilters): Promise<WasteStats> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    return this.get<WasteStats>(`/medical-wastes/stats?${params}`)
  }

  // Gestión de categorías
  async getWasteCategories(): Promise<WasteCategory[]> {
    const response = await this.get<PaginatedResponse<WasteCategory>>('/waste-categories?populate=deep')
    return response.data
  }

  async getWasteCategory(id: string): Promise<WasteCategory> {
    return this.get<WasteCategory>(`/waste-categories/${id}?populate=deep`)
  }

  async createWasteCategory(data: CreateCategoryRequest): Promise<WasteCategory> {
    return this.post<WasteCategory>('/waste-categories', { data })
  }

  async updateWasteCategory(id: string, data: Partial<CreateCategoryRequest>): Promise<WasteCategory> {
    return this.put<WasteCategory>(`/waste-categories/${id}`, { data })
  }

  async deleteWasteCategory(id: string): Promise<void> {
    await this.delete(`/waste-categories/${id}`)
  }

  // Gestión de contenedores
  async getWasteContainers(department_id?: string): Promise<WasteContainer[]> {
    const params = department_id ? `?filters[department][id][$eq]=${department_id}&populate=deep` : '?populate=deep'
    const response = await this.get<PaginatedResponse<WasteContainer>>(`/waste-containers${params}`)
    return response.data
  }

  async getWasteContainer(id: string): Promise<WasteContainer> {
    return this.get<WasteContainer>(`/waste-containers/${id}?populate=deep`)
  }

  async createWasteContainer(data: CreateContainerRequest): Promise<WasteContainer> {
    return this.post<WasteContainer>('/waste-containers', { data })
  }

  async updateWasteContainer(id: string, data: Partial<CreateContainerRequest>): Promise<WasteContainer> {
    return this.put<WasteContainer>(`/waste-containers/${id}`, { data })
  }

  async deleteWasteContainer(id: string): Promise<void> {
    await this.delete(`/waste-containers/${id}`)
  }

  async updateContainerStatus(id: string, status: WasteContainer['status']): Promise<WasteContainer> {
    return this.put<WasteContainer>(`/waste-containers/${id}`, { 
      data: { status } 
    })
  }

  async emptyContainer(id: string): Promise<WasteContainer> {
    return this.post<WasteContainer>(`/waste-containers/${id}/empty`)
  }

  // Búsqueda y filtros
  async searchWastes(query: string): Promise<MedicalWaste[]> {
    const response = await this.get<PaginatedResponse<MedicalWaste>>(
      `/medical-wastes?filters[$or][0][description][$containsi]=${query}&filters[$or][1][generator_name][$containsi]=${query}&populate=deep`
    )
    return response.data
  }

  async getWastesByQRCode(qrCode: string): Promise<WasteContainer | null> {
    try {
      const response = await this.get<PaginatedResponse<WasteContainer>>(
        `/waste-containers?filters[qr_code][$eq]=${qrCode}&populate=deep`
      )
      return response.data[0] || null
    } catch {
      return null
    }
  }
}

export const wasteService = WasteService.getInstance()
