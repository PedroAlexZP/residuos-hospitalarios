"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  Users,
  FileText,
  Route,
  ExternalLink,
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

const navigationItems = [
  {
    title: "Gestión de usuarios",
    icon: Users,
    href: "/usuarios",
  },
  {
    title: "Registro y clasificación",
    icon: FileText,
    href: "/registro",
  },
  {
    title: "Trazabilidad interna",
    icon: Route,
    href: "/trazabilidad",
  },
  {
    title: "Gestión externa",
    icon: ExternalLink,
    href: "/gestion-externa",
  },
  {
    title: "Reportes y cumplimiento",
    icon: BarChart3,
    href: "/reportes",
  },
  {
    title: "Capacitación y soporte",
    icon: GraduationCap,
    href: "/capacitacion",
  },
  {
    title: "Administración del sistema",
    icon: Settings,
    href: "/administracion",
  },
]

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Sistema</span>
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
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Juan Pérez</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Ver perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-9" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
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
          {theme === "dark" ? "Modo claro" : "Modo oscuro"}
        </Button>

        {/* Help */}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
          <HelpCircle className="h-4 w-4" />
          Ayuda
        </Button>

        {/* Database */}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
          <Database className="h-4 w-4" />
          Base de datos
        </Button>
      </div>
    </div>
  )
}
