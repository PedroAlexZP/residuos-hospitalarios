"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { getUserPermissions, hasPermission, type Permission } from "@/lib/permissions"
import { useAuth } from "@/hooks/use-auth"

interface SidebarProps {
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  module?: string
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["generador", "supervisor", "transportista", "gestor_externo", "admin"],
  },
  {
    title: "Residuos",
    href: "/residuos",
    icon: Trash2,
    roles: ["generador", "supervisor", "admin"],
    module: "residuos",
  },
  {
    title: "Etiquetas",
    href: "/etiquetas",
    icon: QrCode,
    roles: ["generador", "supervisor", "admin"],
    module: "etiquetas",
  },
  {
    title: "Pesaje",
    href: "/pesaje",
    icon: Scale,
    roles: ["supervisor", "transportista", "admin"],
    module: "pesajes",
  },
  {
    title: "Entregas",
    href: "/entregas",
    icon: Truck,
    roles: ["supervisor", "transportista", "gestor_externo", "admin"],
    module: "entregas",
  },
  {
    title: "Incidencias",
    href: "/incidencias",
    icon: AlertTriangle,
    roles: ["generador", "supervisor", "transportista", "gestor_externo", "admin"],
    module: "incidencias",
  },
  {
    title: "Reportes",
    href: "/reportes",
    icon: FileText,
    roles: ["supervisor", "gestor_externo", "admin"],
    module: "reportes",
  },
  {
    title: "Capacitaciones",
    href: "/capacitaciones",
    icon: BookOpen,
    roles: ["generador", "supervisor", "transportista", "gestor_externo", "admin"],
    module: "capacitaciones",
  },
  {
    title: "Usuarios",
    href: "/usuarios",
    icon: Users,
    roles: ["admin"],
    module: "usuarios",
  },
]

export function Sidebar({ className }: SidebarProps) {
  const { user, loading, signOut } = useAuth()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const loadPermissions = async () => {
      if (user) {
        try {
          const userPermissions = await getUserPermissions(user.rol)
          setPermissions(userPermissions)
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

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trash2 className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Hospital Waste</span>
              <span className="text-xs text-muted-foreground">Management</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    isActive && "bg-secondary font-medium",
                    isCollapsed && "px-2",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
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
            className={cn("w-full justify-start gap-3", isCollapsed && "px-2")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!isCollapsed && <span>Cambiar tema</span>}
          </Button>
        </div>

        {/* User Profile */}
        {user && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-3 h-11", isCollapsed && "px-2")}
              onClick={() => setShowProfile(!showProfile)}
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {user.nombre_completo
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium truncate max-w-[120px]">{user.nombre_completo}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.rol.replace("_", " ")}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </>
              )}
            </Button>

            {showProfile && !isCollapsed && (
              <div className="space-y-1 pl-3">
                <Link href="/perfil">
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
                    <Settings className="h-4 w-4" />
                    <span>Mi Perfil</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-background lg:border-r",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          className,
        )}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-3 w-3" />
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
