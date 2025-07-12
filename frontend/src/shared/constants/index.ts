/**
 * Constantes utilizadas en toda la aplicación
 */

import type { UserRole } from '../types'

// Roles de usuario
export const USER_ROLES: Record<UserRole, string> = {
  generador: 'Generador',
  supervisor: 'Supervisor',
  transportista: 'Transportista',
  gestor_externo: 'Gestor Externo',
  administrador: 'Administrador',
} as const

// Estados de residuos
export const WASTE_STATUS = {
  GENERATED: 'generated',
  COLLECTED: 'collected',
  IN_TRANSIT: 'in_transit',
  DISPOSED: 'disposed',
} as const

// Tipos de residuos
export const WASTE_TYPES = {
  INFECTIOUS: 'infectious',
  PATHOLOGICAL: 'pathological',
  PHARMACEUTICAL: 'pharmaceutical',
  CHEMICAL: 'chemical',
  RADIOACTIVE: 'radioactive',
} as const

// Niveles de peligrosidad
export const HAZARD_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

// Estados de contenedores
export const CONTAINER_STATUS = {
  EMPTY: 'empty',
  PARTIAL: 'partial',
  FULL: 'full',
  MAINTENANCE: 'maintenance',
} as const

// Métodos de disposición
export const DISPOSAL_METHODS = {
  INCINERATION: 'incineration',
  AUTOCLAVE: 'autoclave',
  CHEMICAL_TREATMENT: 'chemical_treatment',
  BURIAL: 'burial',
} as const

// Colores para estados
export const STATUS_COLORS = {
  [WASTE_STATUS.GENERATED]: 'bg-blue-100 text-blue-800',
  [WASTE_STATUS.COLLECTED]: 'bg-yellow-100 text-yellow-800',
  [WASTE_STATUS.IN_TRANSIT]: 'bg-orange-100 text-orange-800',
  [WASTE_STATUS.DISPOSED]: 'bg-green-100 text-green-800',
} as const

// Iconos para tipos de residuos
export const WASTE_TYPE_ICONS = {
  [WASTE_TYPES.INFECTIOUS]: '🦠',
  [WASTE_TYPES.PATHOLOGICAL]: '🩸',
  [WASTE_TYPES.PHARMACEUTICAL]: '💊',
  [WASTE_TYPES.CHEMICAL]: '⚗️',
  [WASTE_TYPES.RADIOACTIVE]: '☢️',
} as const

// Expresiones regulares de validación
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/,
  CERTIFICATE_NUMBER: /^[A-Z0-9]{6,20}$/,
} as const

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es obligatorio',
  INVALID_EMAIL: 'Formato de email inválido',
  INVALID_PHONE: 'Formato de teléfono inválido',
  MIN_LENGTH: (min: number) => `Mínimo ${min} caracteres`,
  MAX_LENGTH: (max: number) => `Máximo ${max} caracteres`,
  INVALID_DATE: 'Fecha inválida',
  FUTURE_DATE_NOT_ALLOWED: 'No se permiten fechas futuras',
  NETWORK_ERROR: 'Error de conexión. Inténtalo de nuevo.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  NOT_FOUND: 'Recurso no encontrado',
  SERVER_ERROR: 'Error del servidor. Inténtalo más tarde.',
} as const
