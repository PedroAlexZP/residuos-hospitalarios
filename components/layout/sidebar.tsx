"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Trash2,
  Home,
  QrCode,
  Scale,
  Truck,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Users,
  Sun,
  Moon,
  Languages,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "next-themes";

// Types
export interface NavItem {
  href: string;
  translationKey: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  group: "main" | "operations" | "logistics" | "management" | "training" | "admin";
  isSubItem?: boolean;
}

interface SidebarProps {
  readonly className?: string;
}

// Custom hook to detect desktop size
export const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);
  
  return isDesktop;
};

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { t, setLanguage, language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isDesktop = useIsDesktop();

  // Navigation items configuration
  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      translationKey: "dashboard",
      icon: Home,
      roles: ["admin", "gestor", "operador", "auditor"],
      group: "main",
    },
    {
      href: "/residuos",
      translationKey: "medicalWaste",
      icon: Trash2,
      roles: ["admin", "gestor", "operador"],
      group: "operations",
    },
    {
      href: "/etiquetas",
      translationKey: "labels",
      icon: QrCode,
      roles: ["admin", "gestor", "operador"],
      group: "operations",
    },
    {
      href: "/pesaje",
      translationKey: "weighing",
      icon: Scale,
      roles: ["admin", "gestor", "operador"],
      group: "operations",
    },
    {
      href: "/incidencias",
      translationKey: "incidents",
      icon: AlertTriangle,
      roles: ["admin", "gestor", "operador", "auditor"],
      group: "operations",
    },
    {
      href: "/entregas",
      translationKey: "deliveries",
      icon: Truck,
      roles: ["admin", "gestor", "operador"],
      group: "logistics",
    },
    {
      href: "/cumplimiento",
      translationKey: "compliance",
      icon: BarChart3,
      roles: ["admin", "gestor", "auditor"],
      group: "management",
    },
    {
      href: "/reportes",
      translationKey: "reports",
      icon: BarChart3,
      roles: ["admin", "gestor", "auditor"],
      group: "management",
    },
    {
      href: "/capacitaciones",
      translationKey: "training",
      icon: BookOpen,
      roles: ["admin", "gestor"],
      group: "training",
    },
    {
      href: "/usuarios",
      translationKey: "users",
      icon: Users,
      roles: ["admin"],
      group: "admin",
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!user) return false;
      return item.roles.includes(user.rol);
    });
  }, [user, navItems]);

  // Group navigation items by category
  const groupedItems = useMemo(() => {
    return filteredNavItems.reduce((groups, item) => {
      const group = item.group;
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, NavItem[]>);
  }, [filteredNavItems]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Render navigation content
  const renderNavContent = () => {
    if (!user) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <p>No hay usuario autenticado.</p>
        </div>
      );
    }

    if (filteredNavItems.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <p>No tienes permisos para ver módulos.</p>
          <p>Tu rol: <span className="font-mono">{user.rol}</span></p>
        </div>
      );
    }

    return (
      <>
        {/* Main Navigation */}
        {groupedItems.main?.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive && "bg-secondary font-medium shadow-sm",
                  isCollapsed && "px-2 justify-center"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{t(item.translationKey)}</span>}
              </Button>
            </Link>
          );
        })}
        
        {/* Operations Section */}
        {groupedItems.operations && !isCollapsed && (
          <div className="my-4 border-t border-border/50" />
        )}
        {groupedItems.operations?.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive && "bg-secondary font-medium shadow-sm",
                  isCollapsed && "px-2"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{t(item.translationKey)}</span>}
              </Button>
            </Link>
          );
        })}
        
        {/* Logistics Section */}
        {groupedItems.logistics && !isCollapsed && (
          <div className="px-2 py-2 mt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Logística
            </h3>
          </div>
        )}
        {groupedItems.logistics?.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive && "bg-secondary font-medium shadow-sm",
                  isCollapsed && "px-2"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{t(item.translationKey)}</span>}
              </Button>
            </Link>
          );
        })}
        
        {/* Management Section */}
        {groupedItems.management && !isCollapsed && (
          <div className="px-2 py-2 mt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Gestión
            </h3>
          </div>
        )}
        {groupedItems.management?.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive && "bg-secondary font-medium shadow-sm",
                  isCollapsed && "px-2"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{t(item.translationKey)}</span>}
              </Button>
            </Link>
          );
        })}
        
        {/* Training Section */}
        {groupedItems.training?.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive && "bg-secondary font-medium shadow-sm",
                  isCollapsed && "px-2"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{t(item.translationKey)}</span>}
              </Button>
            </Link>
          );
        })}
        
        {/* Admin Section */}
        {groupedItems.admin && !isCollapsed && (
          <div className="px-2 py-2 mt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Administración
            </h3>
          </div>
        )}
        {groupedItems.admin?.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive && "bg-secondary font-medium shadow-sm",
                  isCollapsed && "px-2"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{t(item.translationKey)}</span>}
              </Button>
            </Link>
          );
        })}
      </>
    );
  };

  // Loading state
  if (!user) {
    return (
      <>
        {!isDesktop && (
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden"
            disabled
          >
            <Menu className="h-4 w-4 animate-pulse" />
          </Button>
        )}
        {isDesktop && (
          <div className="flex h-full w-64 flex-col border-r bg-background">
            <div className="flex h-16 items-center justify-center border-b">
              <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex-1 space-y-3 p-4">
              {Array.from({ length: 6 }, (_, idx) => (
                <div key={`loading-skeleton-item-${idx}`} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // Mobile view with Sheet
  if (!isDesktop) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex h-16 items-center border-b px-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Trash2 className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{t("appName")}</span>
                    <span className="text-xs text-muted-foreground">{t("appSubtitle")}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation */}
              <ScrollArea className="flex-1 px-3 py-4">
                <nav className="space-y-1">{renderNavContent()}</nav>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t p-4">
                <div className="mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-full justify-start gap-3"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>{t("changeTheme")}</span>
                  </Button>
                </div>
                <div className="mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLanguage(language === "es" ? "en" : "es")}
                    className="w-full justify-start gap-3"
                  >
                    <Languages className="h-4 w-4" />
                    <span>{t("changeLanguage")}</span>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start gap-3"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("logout")}</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop view
  return (
    <div
      className={cn(
        "sticky top-0 h-screen bg-background border-r transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Trash2 className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{t("appName")}</span>
                <span className="text-xs text-muted-foreground">{t("appSubtitle")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">{renderNavContent()}</nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "w-full justify-start gap-3",
                isCollapsed && "px-2 justify-center"
              )}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {!isCollapsed && <span>{t("changeTheme")}</span>}
            </Button>
          </div>
          <div className="mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
              className={cn(
                "w-full justify-start gap-3",
                isCollapsed && "px-2 justify-center"
              )}
            >
              <Languages className="h-4 w-4" />
              {!isCollapsed && <span>{t("changeLanguage")}</span>}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={cn(
              "w-full justify-start gap-3",
              isCollapsed && "px-2 justify-center"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>{t("logout")}</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}