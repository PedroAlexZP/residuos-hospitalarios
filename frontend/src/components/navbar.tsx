"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import {
  FileText,
  Route,
  Truck,
  BarChart3,
  GraduationCap,
  Settings,
  Search,
  User,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  HelpCircle,
  Database,
  Shield,
  Menu,
  Globe,
  Package,
  Tag,
  Scale,
  Warehouse,
  ClipboardCheck,
  AlertTriangle,
  BookOpen,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth"
import { PERMISSIONS } from "@/lib/auth"
import type { UserRole } from "@/lib/types"

// Configuración de idiomas
const languages = {
  es: {
    system: "Sistema de Residuos",
    search: "Buscar...",
    profile: "Ver perfil",
    logout: "Cerrar sesión",
    help: "Ayuda",
    database: "Base de datos",
    lightMode: "Modo claro",
    darkMode: "Modo oscuro",
    // Navegación
    dashboard: "Panel de Control",
    wasteRegistration: "Registro de residuos",
    labeling: "Etiquetado y clasificación",
    internalTraceability: "Trazabilidad interna",
    externalManagement: "Gestión externa",
    reportsCompliance: "Reportes y cumplimiento",
    training: "Capacitación y soporte",
    systemAdmin: "Administración del sistema",
    departments: "Departamentos",
    // Submódulos
    wasteCollection: "Recolección interna",
    weighing: "Pesaje",
    temporaryStorage: "Almacenamiento temporal",
    delivery: "Registro de entrega",
    treatment: "Confirmación de tratamiento",
    finalDestination: "Destino final",
    normativeReports: "Reportes normativos",
    compliancePanel: "Panel de cumplimiento",
    incidents: "Registro de incidencias",
    normativeLibrary: "Biblioteca normativa",
    parameters: "Gestión de parámetros",
    permissions: "Control de permisos",
  },
  en: {
    system: "Waste Management System",
    search: "Search...",
    profile: "View profile",
    logout: "Sign out",
    help: "Help",
    database: "Database",
    lightMode: "Light mode",
    darkMode: "Dark mode",
    // Navigation
    dashboard: "Dashboard",
    wasteRegistration: "Waste Registration",
    labeling: "Labeling & Classification",
    internalTraceability: "Internal Traceability",
    externalManagement: "External Management",
    reportsCompliance: "Reports & Compliance",
    training: "Training & Support",
    systemAdmin: "System Administration",
    departments: "Departments",
    // Submodules
    wasteCollection: "Internal Collection",
    weighing: "Weighing",
    temporaryStorage: "Temporary Storage",
    delivery: "Delivery Registration",
    treatment: "Treatment Confirmation",
    finalDestination: "Final Destination",
    normativeReports: "Normative Reports",
    compliancePanel: "Compliance Panel",
    incidents: "Incident Registration",
    normativeLibrary: "Normative Library",
    parameters: "Parameter Management",
    permissions: "Permission Control",
  },
}

// Configuración de navegación por rol con permisos
const getNavigationItems = (role: UserRole, t: typeof languages.es, hasPermission: (permission: string) => boolean) => {
  const baseItems = [
    {
      title: t.dashboard,
      icon: BarChart3,
      href: "/",
      roles: ["generador", "supervisor", "transportista", "gestor_externo", "administrador"],
      subItems: [],
    },
    {
      title: t.departments,
      icon: Package,
      href: "/departamentos",
      roles: ["administrador", "supervisor"],
      permission: PERMISSIONS.VIEW_USERS,
      subItems: [],
    },
    {
      title: t.wasteRegistration,
      icon: Package,
      href: "/residuos",
      roles: ["generador", "administrador"],
      permission: PERMISSIONS.CREATE_WASTE,
      subItems: [],
    },
    {
      title: t.labeling,
      icon: Tag,
      href: "/etiquetado",
      roles: ["generador", "supervisor", "administrador"],
      subItems: [],
    },
    {
      title: t.internalTraceability,
      icon: Route,
      href: "/trazabilidad",
      roles: ["supervisor", "transportista", "administrador"],
      permission: PERMISSIONS.VIEW_COLLECTION,
      subItems: [
        { title: t.wasteCollection, href: "/trazabilidad/recoleccion", icon: Truck },
        { title: t.weighing, href: "/trazabilidad/pesaje", icon: Scale },
        { title: t.temporaryStorage, href: "/trazabilidad/almacenamiento", icon: Warehouse },
      ],
    },
    {
      title: t.externalManagement,
      icon: Truck,
      href: "/gestion-externa",
      roles: ["supervisor", "transportista", "gestor_externo", "administrador"],
      subItems: [
        { title: t.delivery, href: "/gestion-externa/entrega", icon: ClipboardCheck },
        { title: t.treatment, href: "/gestion-externa/tratamiento", icon: Settings },
        { title: t.finalDestination, href: "/gestion-externa/destino-final", icon: Database },
      ],
    },
    {
      title: t.reportsCompliance,
      icon: BarChart3,
      href: "/reportes",
      roles: ["supervisor", "gestor_externo", "administrador"],
      permission: PERMISSIONS.VIEW_REPORTS,
      subItems: [
        { title: t.normativeReports, href: "/reportes/normativos", icon: FileText },
        { title: t.compliancePanel, href: "/reportes/cumplimiento", icon: Shield },
      ],
    },
    {
      title: t.training,
      icon: GraduationCap,
      href: "/capacitacion",
      roles: ["generador", "supervisor", "transportista", "gestor_externo", "administrador"],
      subItems: [
        { title: t.incidents, href: "/capacitacion/incidencias", icon: AlertTriangle },
        { title: t.normativeLibrary, href: "/capacitacion/biblioteca", icon: BookOpen },
      ],
    },
    {
      title: t.systemAdmin,
      icon: Settings,
      href: "/administracion",
      roles: ["administrador"],
      permission: PERMISSIONS.SYSTEM_CONFIG,
      subItems: [
        { title: t.parameters, href: "/administracion/parametros", icon: Settings },
        { title: t.permissions, href: "/administracion/permisos", icon: Shield },
      ],
    },
  ]

  return baseItems.filter((item) => {
    // Check role access
    if (!item.roles.includes(role)) return false

    // Check permission if specified
    if (item.permission && !hasPermission(item.permission)) return false

    return true
  })
}

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const [language, setLanguage] = React.useState<"es" | "en">("es")
  const [isOpen, setIsOpen] = React.useState(false)
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const { user, logout, hasPermission } = useAuth()

  const t = languages[language]
  const navigationItems = user ? getNavigationItems(user.role, t, hasPermission) : []

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => (prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]))
  }

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      generador: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      supervisor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      transportista: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      gestor_externo: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      administrador: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[role]
  }

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      generador: "Generador",
      supervisor: "Supervisor Ambiental",
      transportista: "Transportista",
      gestor_externo: "Gestor Externo",
      administrador: "Administrador",
    }
    return labels[role]
  }

  if (!mounted || !user) {
    return null
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">{t.system}</span>
        </div>
      </div>

      <Separator />

      {/* User Profile */}
      <div className="px-4 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || "/placeholder.svg?height=32&width=32"} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{user.name}</span>
                  <Badge variant="secondary" className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.department}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              {t.profile}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Language Selector */}
      <div className="px-4 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between bg-transparent">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{language === "es" ? "Español" : "English"}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setLanguage("es")}>🇪🇸 Español</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("en")}>🇺🇸 English</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t.search} className="pl-9" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4">
        {navigationItems.map((item) => (
          <div key={item.href}>
            <div className="flex items-center">
              <Link
                href={item.href}
                className={`flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
              {item.subItems.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => toggleExpanded(item.href)} className="h-8 w-8 p-0">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${expandedItems.includes(item.href) ? "rotate-180" : ""}`}
                  />
                </Button>
              )}
            </div>
            {item.subItems.length > 0 && expandedItems.includes(item.href) && (
              <div className="ml-4 mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                      pathname === subItem.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <subItem.icon className="h-3 w-3" />
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <Separator />

      {/* Bottom Actions */}
      <div className="space-y-1 p-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full justify-start gap-3"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? t.lightMode : t.darkMode}
        </Button>

        {/* Help */}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
          <HelpCircle className="h-4 w-4" />
          {t.help}
        </Button>

        {/* Database */}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
          <Database className="h-4 w-4" />
          {t.database}
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
        <NavContent />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="fixed top-4 left-4 z-50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
