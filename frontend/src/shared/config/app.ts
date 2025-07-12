/**
 * Configuración global de la aplicación
 */

export const APP_CONFIG = {
  // URLs de API
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337/api",
  
  // Configuración de paginación
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Configuración de autenticación
  TOKEN_KEY: "auth_token",
  USER_KEY: "auth_user",
  
  // Configuración de archivos
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  
  // Configuración de la aplicación
  APP_NAME: "Sistema de Gestión de Residuos Hospitalarios",
  APP_VERSION: "1.0.0",
  
  // URLs de navegación
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    UNAUTHORIZED: '/unauthorized',
  } as const,
  
  // Configuración de tema
  THEME: {
    DEFAULT: 'light',
    STORAGE_KEY: 'theme',
  },
  
  // Configuración de notificaciones
  NOTIFICATIONS: {
    DURATION: 5000,
    MAX_NOTIFICATIONS: 5,
  },
} as const

export type AppConfig = typeof APP_CONFIG
