/**
 * Tipos específicos del módulo de residuos
 */

import { BaseEntity } from '@/shared/types'

export interface WasteCategory extends BaseEntity {
  name: string
  handling_protocol: string
  disposal_method: string
  hazard_level: 'low' | 'medium' | 'high' | 'critical'
  description?: string
  color?: string
  icon?: string
  waste_containers?: WasteContainer[]
}

export interface MedicalWaste extends BaseEntity {
  generation_date: string
  weight: number
  description?: string
  status: 'generated' | 'collected' | 'in_transit' | 'disposed'
  department_id: string
  category_id: string
  container_id?: string
  generator_name: string
  // waste_collections?: WasteCollection[] // Se definirá en el módulo de collection
  department?: {
    id: string
    name: string
    location?: string
  }
  category?: WasteCategory
}

export interface WasteContainer extends BaseEntity {
  capacity: number
  current_weight: number
  location: string
  status: 'empty' | 'partial' | 'full' | 'maintenance'
  category_id: string
  department_id: string
  qr_code?: string
  last_emptied?: string
  category?: WasteCategory
  department?: {
    id: string
    name: string
    location?: string
  }
}

export interface CreateWasteRequest {
  generation_date: string
  weight: number
  description?: string
  department_id: string
  category_id: string
  container_id?: string
  generator_name: string
}

export interface UpdateWasteRequest extends Partial<CreateWasteRequest> {
  status?: MedicalWaste['status']
}

export interface CreateCategoryRequest {
  name: string
  handling_protocol: string
  disposal_method: string
  hazard_level: WasteCategory['hazard_level']
  description?: string
  color?: string
  icon?: string
}

export interface CreateContainerRequest {
  capacity: number
  location: string
  category_id: string
  department_id: string
  qr_code?: string
}

export interface WasteFilters {
  department_id?: string
  category_id?: string
  status?: MedicalWaste['status']
  date_from?: string
  date_to?: string
  generator_name?: string
}

export interface WasteStats {
  total_weight: number
  total_count: number
  by_category: Array<{
    category_id: string
    category_name: string
    weight: number
    count: number
  }>
  by_status: Array<{
    status: MedicalWaste['status']
    count: number
  }>
  by_department: Array<{
    department_id: string
    department_name: string
    weight: number
    count: number
  }>
}
