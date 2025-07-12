/**
 * Tipos para el módulo de departamentos
 */

import { BaseEntity } from '@/shared/types'

export interface Department extends BaseEntity {
  name: string
  location?: string
  description?: string
  is_active: boolean
  supervisor_id?: string
  contact_phone?: string
  contact_email?: string
  supervisor?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateDepartmentRequest {
  name: string
  location?: string
  description?: string
  supervisor_id?: string
  contact_phone?: string
  contact_email?: string
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  is_active?: boolean
}

export interface DepartmentStats {
  total_wastes: number
  total_weight: number
  active_containers: number
  last_collection?: string
  waste_by_category: Array<{
    category_id: string
    category_name: string
    count: number
    weight: number
  }>
}
