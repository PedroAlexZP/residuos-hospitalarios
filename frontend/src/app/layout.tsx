import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "sonner"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import Navbar from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

export const metadata: Metadata = {
  title: "Sistema de Gestión de Residuos Hospitalarios",
  description: "Sistema integral para la gestión, trazabilidad y cumplimiento normativo de residuos hospitalarios",
    generator: 'v0.dev'
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ProtectedRoute>
            <div className="flex h-screen">
              <Navbar />
              <main className="flex-1 overflow-auto md:ml-0">
                <div className="md:hidden h-16" />
                {children}
              </main>
            </div>
          </ProtectedRoute>
        </Providers>
      </body>
    </html>
  )
}
