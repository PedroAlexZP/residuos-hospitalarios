"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

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
    incidencias: "Incidencias",
    reportes: "Reportes",
    capacitaciones: "Capacitaciones",
    usuarios: "Usuarios",
    
    // UI Elements
    changeTheme: "Cambiar tema",
    changeLanguage: "Cambiar idioma",
    profile: "Mi Perfil",
    logout: "Cerrar Sesión",
    openMenu: "Abrir menú",
    
    // App
    appName: "Hospital Waste",
    appSubtitle: "Management",
    
    // Roles
    generador: "Generador",
    supervisor: "Supervisor",
    transportista: "Transportista",
    gestor_externo: "Gestor Externo",
    admin: "Administrador",
  },
  en: {
    // Navigation
    dashboard: "Dashboard",
    residuos: "Waste",
    etiquetas: "Labels",
    pesaje: "Weighing",
    entregas: "Deliveries",
    incidencias: "Incidents",
    reportes: "Reports",
    capacitaciones: "Training",
    usuarios: "Users",
    
    // UI Elements
    changeTheme: "Change theme",
    changeLanguage: "Change language",
    profile: "My Profile",
    logout: "Sign Out",
    openMenu: "Open menu",
    
    // App
    appName: "Hospital Waste",
    appSubtitle: "Management",
    
    // Roles
    generador: "Generator",
    supervisor: "Supervisor",
    transportista: "Transporter",
    gestor_externo: "External Manager",
    admin: "Administrator",
  },
}

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
    const translations_lang = translations[language]
    return translations_lang[key as keyof typeof translations_lang] || key
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
