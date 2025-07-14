"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    dashboard: "Dashboard",
    residuos: "Residuos",
    etiquetas: "Etiquetas", 
    pesaje: "Pesaje",
    entregas: "Entregas",
    capacitaciones: "Capacitaciones",
    incidencias: "Incidencias",
    cumplimiento: "Cumplimiento",
    reportes: "Reportes",
    usuarios: "Usuarios",
    search: "Buscar...",
    notifications: "Notificaciones",
    profile: "Perfil",
    settings: "Configuración",
    logout: "Cerrar sesión",
    language: "Idioma",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    toggleTheme: "Cambiar tema",
    changeTheme: "Cambiar tema",
    changeLanguage: "Cambiar idioma",
    appName: "Residuos Hospitalarios",
    appSubtitle: "Gestión",
    generador: "Generador",
    supervisor: "Supervisor", 
    transportista: "Transportista",
    gestor_externo: "Gestor Externo",
    gestorexterno: "Gestor Externo",
    admin: "Administrador",
    openMenu: "Abrir menú",
  },
  en: {
    dashboard: "Dashboard",
    residuos: "Waste",
    etiquetas: "Labels",
    pesaje: "Weighing", 
    entregas: "Deliveries",
    capacitaciones: "Training",
    incidencias: "Incidents",
    cumplimiento: "Compliance",
    reportes: "Reports",
    usuarios: "Users",
    search: "Search...",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    logout: "Sign out",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    toggleTheme: "Toggle theme",
    changeTheme: "Change theme",
    changeLanguage: "Change language",
    appName: "Hospital Waste",
    appSubtitle: "Management",
    generador: "Generator",
    supervisor: "Supervisor",
    transportista: "Transporter", 
    gestor_externo: "External Manager",
    gestorexterno: "External Manager",
    admin: "Administrator",
    openMenu: "Open menu",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
