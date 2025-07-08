// Tipos base del sistema
export type UserRole = "generador" | "supervisor" | "transportista" | "gestor_externo" | "administrador"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Entidades principales actualizadas según Strapi
export interface DepartmentAttribute {
  id: string
  name: string
  location?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  medical_wastes?: MedicalWaste[]
  waste_audits?: WasteAudit[]
}

export interface MedicalWaste {
  id: string
  generation_date: string
  weight: string
  description?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  department?: DepartmentAttribute
  waste_collections?: WasteCollection[]
}

export interface WasteAudit {
  id: string
  audit_date: string
  auditor: string
  compliance_score: number
  findings?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  department?: DepartmentAttribute
}

export interface WasteCategory {
  id: string
  name: string
  handling_protocol: string
  disposal_method: string
  hazard_level?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  waste_containers?: WasteContainer[]
}

export interface WasteCollection {
  id: string
  collection_date: string
  collected_by: string
  quantity: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
  medical_wastes?: MedicalWaste[]
  waste_disposal?: WasteDisposal
}

export interface WasteContainer {
  id: string
  capacity: number
  location: string
  status_name?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  category?: WasteCategory
}

export interface WasteDisposal {
  id: string
  disposal_date: string
  disposal_method: string
  disposal_location: string
  certificate_number?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  collection?: WasteCollection
}

export interface WasteHandler {
  id: string
  name: string
  certification: string
  contact_info: string
  role?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
