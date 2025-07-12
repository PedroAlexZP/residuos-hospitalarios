/**
 * Servicio para manejo de departamentos
 */

import { BaseApiClient } from '@/shared/services/base-api'
import { PaginatedResponse } from '@/shared/types'
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentStats
} from '../types'

export class DepartmentService extends BaseApiClient {
  private static instance: DepartmentService

  static getInstance(): DepartmentService {
    if (!DepartmentService.instance) {
      DepartmentService.instance = new DepartmentService()
    }
    return DepartmentService.instance
  }

  async getDepartments(): Promise<Department[]> {
    const response = await this.get<PaginatedResponse<Department>>('/departments?populate=supervisor')
    return response.data
  }

  async getDepartment(id: string): Promise<Department> {
    return this.get<Department>(`/departments/${id}?populate=supervisor`)
  }

  async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    return this.post<Department>('/departments', { data })
  }

  async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    return this.put<Department>(`/departments/${id}`, { data })
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.delete(`/departments/${id}`)
  }

  async getDepartmentStats(id: string): Promise<DepartmentStats> {
    return this.get<DepartmentStats>(`/departments/${id}/stats`)
  }

  async getActiveDepartments(): Promise<Department[]> {
    const response = await this.get<PaginatedResponse<Department>>(
      '/departments?filters[is_active][$eq]=true&populate=supervisor'
    )
    return response.data
  }

  async searchDepartments(query: string): Promise<Department[]> {
    const response = await this.get<PaginatedResponse<Department>>(
      `/departments?filters[$or][0][name][$containsi]=${query}&filters[$or][1][location][$containsi]=${query}&populate=supervisor`
    )
    return response.data
  }

  async toggleDepartmentStatus(id: string, isActive: boolean): Promise<Department> {
    return this.put<Department>(`/departments/${id}`, {
      data: { is_active: isActive }
    })
  }
}

export const departmentService = DepartmentService.getInstance()
