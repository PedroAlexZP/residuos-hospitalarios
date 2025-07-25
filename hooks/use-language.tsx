"use client"

import React, { createContext, useContext, useState, useMemo } from "react"

type Language = "es" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const translations = {
  es: {
    dashboard: "Dashboard",
    search: "Buscar...",
    settings: "Configuración",
    profile: "Perfil",
    help: "Ayuda",
    logout: "Cerrar sesión",
    home: "Inicio",
    residuos: "Residuos",
    etiquetas: "Etiquetas",
    pesaje: "Pesaje",
    entregas: "Entregas",
    incidencias: "Incidencias",
    reportes: "Reportes",
    capacitaciones: "Capacitaciones",
    usuarios: "Usuarios",
    newWasteCollection: "Nueva recolección",
    auditCompleted: "Auditoría completada",
    incidentReported: "Incidente reportado"
  },
  en: {
    dashboard: "Dashboard",
    search: "Search...",
    settings: "Settings",
    profile: "Profile",
    help: "Help",
    logout: "Logout",
    home: "Home",
    residuos: "Waste",
    etiquetas: "Labels",
    pesaje: "Weighing",
    entregas: "Deliveries",
    incidencias: "Incidents",
    reportes: "Reports",
    capacitaciones: "Training",
    usuarios: "Users",
    newWasteCollection: "New waste collection",
    auditCompleted: "Audit completed",
    incidentReported: "Incident reported"
  }
}

export function LanguageProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [language, setLanguage] = useState<Language>("es")

  const contextValue = useMemo(() => {
    const t = (key: string): string => {
      const translationsForLanguage = translations[language]
      return (translationsForLanguage as any)[key] || key
    }

    return { language, setLanguage, t }
  }, [language])

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
