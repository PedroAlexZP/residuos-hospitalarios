import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar: drawer en móvil, sticky en md+ */}
      <Sidebar />
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-auto">
        <Header />
        <main className="p-4 md:p-6 flex-1 min-w-0 overflow-x-auto">{children}</main>
      </div>
    </div>
  )
}
