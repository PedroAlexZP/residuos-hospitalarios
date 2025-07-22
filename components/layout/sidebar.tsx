"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Menu,
  Home,
  Trash2,
  QrCode,
  Scale,
  Truck,
  AlertTriangle,
  FileText,
  BookOpen,
  Users,
  LogOut,
  Sun,
  Moon,
  Languages,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/hooks/use-language"
import { getUserPermissions, hasPermission, type Permission } from "@/lib/permissions"
import { useAuth } from "@/hooks/use-auth"

interface SidebarProps {
  className?: string
}

interface NavItem {
  title: string
  translationKey: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  module?: string
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    translationKey: "dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["generador", "supervisor", "transportista", "gestor_externo", "admin"],
  },
  {
    title: "Residuos",
    translationKey: "residuos",
    href: "/residuos",
    icon: Trash2,
    roles: ["generador", "supervisor", "admin"],
    module: "residuos",
  },
  {
    title: "Etiquetas",
    translationKey: "etiquetas",
    href: "/etiquetas",
    icon: QrCode,
    roles: ["generador", "supervisor", "admin"],
    module: "etiquetas",
  },
  {
    title: "Pesaje",
    translationKey: "pesaje",
    href: "/pesaje",
    icon: Scale,
    roles: ["supervisor", "transportista", "admin"],
    module: "pesajes",
  },
  {
    title: "Entregas",
    translationKey: "entregas",
    href: "/entregas",
    icon: Truck,
    roles: ["supervisor", "transportista", "gestor_externo", "admin"],
    module: "entregas",
  },
  {
    title: "Incidencias",
    translationKey: "incidencias",
    href: "/incidencias",
    icon: AlertTriangle,
    roles: ["generador", "supervisor", "transportista", "gestor_externo", "admin"],
    module: "incidencias",
  },
  {
    title: "Reportes",
    translationKey: "reportes",
    href: "/reportes",
    icon: FileText,
    roles: ["supervisor", "gestor_externo", "admin"],
    module: "reportes",
  },
  {
    title: "Cumplimiento",
    translationKey: "cumplimiento", 
    href: "/cumplimiento",
    icon: FileText,
    roles: ["supervisor", "gestor_externo", "admin"],
    module: "cumplimiento",
  },
  {
    title: "Capacitaciones",
    translationKey: "capacitaciones",
    href: "/capacitaciones",
    icon: BookOpen,
    roles: ["generador", "supervisor", "transportista", "gestor_externo", "admin"],
    module: "capacitaciones",
  },
  {
    title: "Usuarios",
    translationKey: "usuarios",
    href: "/usuarios",
    icon: Users,
    roles: ["admin"],
    module: "usuarios",
  },
]

// Hook para detectar si es escritorio (md+)
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const check = () => setIsDesktop(window.matchMedia("(min-width: 768px)").matches)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isDesktop
}

export function Sidebar({ className, open, onOpenChange }: SidebarProps & { open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const { user, signOut } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    const loadPermissions = async () => {
      if (user) {
        try {
          const userPermissions = await getUserPermissions(user.rol)
          setPermissions(userPermissions)
          console.log("ROL DEL USUARIO:", user.rol)
          console.log("PERMISOS OBTENIDOS:", userPermissions)
        } catch (error) {
          console.error("Error loading permissions:", error)
        }
      }
    }

    loadPermissions()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const canAccessItem = (item: NavItem) => {
    if (!user) return false

    // Verificar rol
    if (!item.roles.includes(user.rol)) return false

    // Verificar permisos específicos del módulo
    if (item.module) {
      return hasPermission(permissions, item.module, "lectura")
    }

    return true
  }

  const filteredNavItems = navItems.filter(canAccessItem)

  // Cambia SidebarContent para aceptar isCollapsed
  const SidebarContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trash2 className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in slide-in-from-left-2 duration-200">
              <span className="text-sm font-semibold">{t("appName")}</span>
              <span className="text-xs text-muted-foreground">{t("appSubtitle")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4 sidebar-scroll">
        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 sidebar-button",
                    isActive && "bg-secondary font-medium shadow-sm",
                    isCollapsed && "px-2 justify-center"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{t(item.translationKey)}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        {/* Theme Toggle */}
        <div className="mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn("w-full justify-start gap-3 sidebar-button", isCollapsed && "px-2 justify-center")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!isCollapsed && <span>{t("changeTheme")}</span>}
          </Button>
        </div>

        {/* Language Toggle */}
        <div className="mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "es" ? "en" : "es")}
            className={cn("w-full justify-start gap-3 sidebar-button", isCollapsed && "px-2 justify-center")}
          >
            <Languages className="h-4 w-4" />
            {!isCollapsed && <span>{t("changeLanguage")}</span>}
          </Button>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={cn("w-full justify-start gap-3 sidebar-button", isCollapsed && "px-2 justify-center")}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>{t("logout")}</span>}
        </Button>
      </div>
    </div>
  )

  // Sidebar sticky y colapsable para escritorio
  const DesktopSidebar = () => (
    <aside
      className={cn(
        "hidden md:sticky md:top-0 md:bg-background md:border-r sidebar-transition",
        isCollapsed ? "md:w-16" : "md:w-64",
        "h-screen flex flex-col",
        className
      )}
    >
      <SidebarContent isCollapsed={isCollapsed} />
      {/* Botón para colapsar/expandir solo en escritorio */}
      <button
        className="hidden md:block absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md hover:shadow-lg sidebar-transition"
        onClick={() => setIsCollapsed((v) => !v)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        type="button"
      >
        <Menu className={cn("h-4 w-4 sidebar-transition", isCollapsed && "rotate-180")} />
      </button>
    </aside>
  )

  // Sidebar tipo drawer para móvil, ahora controlado por props
  const MobileSidebar = () => (
    <Sheet open={!!open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-64 max-w-full">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  )

  return isDesktop ? <DesktopSidebar /> : <MobileSidebar />
}

// Permitir que el layout use el estado de colapso
export const SIDEBAR_WIDTH = 256 // w-64
export const SIDEBAR_COLLAPSED_WIDTH = 64 // w-16
