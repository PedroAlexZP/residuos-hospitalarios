export const translations = {
  es: {
    // Common
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    save: "Guardar",
    edit: "Editar",
    delete: "Eliminar",
    create: "Crear",
    search: "Buscar",
    filter: "Filtrar",
    export: "Exportar",
    import: "Importar",
    actions: "Acciones",
    status: "Estado",
    date: "Fecha",
    name: "Nombre",
    description: "Descripción",
    code: "Código",
    weight: "Peso",
    location: "Ubicación",

    // Navigation
    dashboard: "Panel de Control",
    wasteRegistration: "Registro de Residuos",
    labeling: "Etiquetado y Clasificación",
    internalTraceability: "Trazabilidad Interna",
    externalManagement: "Gestión Externa",
    reportsCompliance: "Reportes y Cumplimiento",
    training: "Capacitación y Soporte",
    systemAdmin: "Administración del Sistema",

    // Entities
    departments: "Departamentos",
    department: "Departamento",
    medicalWastes: "Residuos Médicos",
    medicalWaste: "Residuo Médico",
    wasteCategories: "Categorías de Residuos",
    wasteCategory: "Categoría de Residuo",
    wasteContainers: "Contenedores",
    wasteContainer: "Contenedor",
    wasteCollections: "Recolecciones",
    wasteCollection: "Recolección",
    wasteHandlers: "Operadores",
    wasteHandler: "Operador",
    wasteDisposals: "Disposiciones",
    wasteDisposal: "Disposición",
    wasteAudits: "Auditorías",
    wasteAudit: "Auditoría",

    // Forms
    required: "Este campo es requerido",
    invalidEmail: "Email inválido",
    minLength: "Mínimo {min} caracteres",
    maxLength: "Máximo {max} caracteres",

    // Status
    active: "Activo",
    inactive: "Inactivo",
    pending: "Pendiente",
    completed: "Completado",
    cancelled: "Cancelado",

    // Risk levels
    riskLow: "Bajo",
    riskMedium: "Medio",
    riskHigh: "Alto",
    riskCritical: "Crítico",
  },
  en: {
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    create: "Create",
    search: "Search",
    filter: "Filter",
    export: "Export",
    import: "Import",
    actions: "Actions",
    status: "Status",
    date: "Date",
    name: "Name",
    description: "Description",
    code: "Code",
    weight: "Weight",
    location: "Location",

    // Navigation
    dashboard: "Dashboard",
    wasteRegistration: "Waste Registration",
    labeling: "Labeling & Classification",
    internalTraceability: "Internal Traceability",
    externalManagement: "External Management",
    reportsCompliance: "Reports & Compliance",
    training: "Training & Support",
    systemAdmin: "System Administration",

    // Entities
    departments: "Departments",
    department: "Department",
    medicalWastes: "Medical Wastes",
    medicalWaste: "Medical Waste",
    wasteCategories: "Waste Categories",
    wasteCategory: "Waste Category",
    wasteContainers: "Containers",
    wasteContainer: "Container",
    wasteCollections: "Collections",
    wasteCollection: "Collection",
    wasteHandlers: "Handlers",
    wasteHandler: "Handler",
    wasteDisposals: "Disposals",
    wasteDisposal: "Disposal",
    wasteAudits: "Audits",
    wasteAudit: "Audit",

    // Forms
    required: "This field is required",
    invalidEmail: "Invalid email",
    minLength: "Minimum {min} characters",
    maxLength: "Maximum {max} characters",

    // Status
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",

    // Risk levels
    riskLow: "Low",
    riskMedium: "Medium",
    riskHigh: "High",
    riskCritical: "Critical",
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.es

export const useTranslation = (language: Language = "es") => {
  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    let translation = translations[language][key] || key

    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, String(value))
      })
    }

    return translation
  }

  return { t }
}
