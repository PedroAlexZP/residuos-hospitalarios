import type React from "react"
import type { Metadata } from "next"
import "./../styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import SupabaseProvider from "@/lib/supabase-provider"
import { LanguageProvider } from "@/hooks/use-language"

export const metadata: Metadata = {
  title: "Sistema de Gestión de Residuos Hospitalarios",
  description: "Plataforma integral para la gestión de residuos hospitalarios siguiendo normativas ISO",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <SupabaseProvider>
          <LanguageProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
              <Toaster />
            </ThemeProvider>
          </LanguageProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
