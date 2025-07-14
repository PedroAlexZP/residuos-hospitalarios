"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "es" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  es: {
    // Navigation
    dashboard: "Dashboard",
    residuos: "Residuos",
    etiquetas: "Etiquetas",
    pesaje: "Pesaje",
    entregas: "Entregas",
    capacitaciones: "Capacitaciones",
    incidencias: "Incidencias",
    cumplimiento: "Cumplimiento",
    reportes: "Reportes",
    
    // Common
    search: "Buscar...",
    notifications: "Notificaciones",
    profile: "Perfil",
    settings: "Configuración",
    logout: "Cerrar sesión",
    language: "Idioma",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    
    // Theme
    toggleTheme: "Cambiar tema",
    
    // Notifications
    newWasteEntry: "Nueva entrada de residuos",
    newWasteEntryDesc: "Se ha registrado un nuevo lote de residuos peligrosos",
    expiredWaste: "Residuos vencidos",
    expiredWasteDesc: "Los residuos #{id} han excedido el tiempo de almacenamiento",
    newTraining: "Nueva capacitación",
    newTrainingDesc: "Capacitación sobre manejo de cortopunzantes programada",
    pendingDelivery: "Entrega pendiente",
    pendingDeliveryDesc: "La entrega #{id} requiere confirmación del gestor externo",
    
    // App
    appName: "Residuos Hospitalarios",
    appSubtitle: "Gestión",
    
    // Roles
    generador: "Generador",
    supervisor: "Supervisor",
    transportista: "Transportista",
    gestor_externo: "Gestor Externo",
    gestorexterno: "Gestor Externo",
    admin: "Administrador",
  },
  en: {
    // Navigation
    dashboard: "Dashboard",
    residuos: "Waste",
    etiquetas: "Labels",
    pesaje: "Weighing",
    entregas: "Deliveries",
    capacitaciones: "Training",
    incidencias: "Incidents",
    cumplimiento: "Compliance",
    reportes: "Reports",
    
    // Common
    search: "Search...",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    logout: "Sign out",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    
    // Theme
    toggleTheme: "Toggle theme",
    
    // Notifications
    newWasteEntry: "New waste entry",
    newWasteEntryDesc: "A new batch of hazardous waste has been registered",
    expiredWaste: "Expired waste",
    expiredWasteDesc: "Waste #{id} has exceeded storage time limit",
    newTraining: "New training",
    newTrainingDesc: "Training on sharps handling scheduled",
    pendingDelivery: "Pending delivery",
    pendingDeliveryDesc: "Delivery #{id} requires confirmation from external manager",
    
    // App
    appName: "Hospital Waste",
    appSubtitle: "Management",
    
    // Roles
    generador: "Generator",
    supervisor: "Supervisor",
    transportista: "Transporter",
    gestor_externo: "External Manager",
    gestorexterno: "External Manager",
    admin: "Administrator",
  },
} as const

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const t = (key: string): string => {
    const translationsForLanguage = translations[language]
    return (translationsForLanguage as any)[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
