"use client"

import { useState } from "react"
import { Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sidebar as SidebarComponent } from "./sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/hooks/use-language"
import { useIsDesktop } from "./sidebar"

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { t } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDesktop = useIsDesktop()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-wrap items-center gap-2 px-2 sm:px-4 md:px-6 h-16 min-h-[4rem]">
        {/* Mobile Menu */}
        {!isDesktop && (
          <>
            <button
              className="md:hidden flex-shrink-0 mr-2"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu className="h-6 w-6" />
            </button>
            {/* Sidebar Drawer en móvil */}
            <SidebarComponent open={sidebarOpen} onOpenChange={setSidebarOpen} />
          </>
        )}
        {/* Title */}
        {title && (
          <div className="flex-1 min-w-[120px]">
            <h1 className="text-base sm:text-lg font-semibold truncate">{title}</h1>
          </div>
        )}

        {/* Search */}
        <div className="flex-1 max-w-xs min-w-[120px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("search")} className="pl-10" />
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex-shrink-0">
          <ThemeToggle />
        </div>

        {/* Notifications */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </Badge>
                <span className="sr-only">{t("notifications")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-w-xs sm:max-w-sm">
              <div className="p-4">
                <h4 className="font-medium">{t("notifications")}</h4>
                <p className="text-sm text-muted-foreground">{t("notificationsUnread")?.replace("{count}", "3")}</p>
              </div>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{t("expiredWaste")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("expiredWasteDesc")?.replace("{id}", "RES-001")}
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{t("newTraining")}</p>
                  <p className="text-xs text-muted-foreground">{t("newTrainingDesc")}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{t("pendingDelivery")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("pendingDeliveryDesc")?.replace("{id}", "ENT-005")}
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
