"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sidebar } from "./sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/hooks/use-language"

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sidebar />
        </div>

        {/* Title */}
        {title && (
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        )}

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("search")} className="pl-10" />
          </div>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
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
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4">
              <h4 className="font-medium">{t("notifications")}</h4>
              <p className="text-sm text-muted-foreground">{t("notificationsUnread").replace("{count}", "3")}</p>
            </div>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{t("expiredWaste")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("expiredWasteDesc").replace("{id}", "RES-001")}
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
                  {t("pendingDeliveryDesc").replace("{id}", "ENT-005")}
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
