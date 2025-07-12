import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Navbar from "@/components/navbar";
import { Providers } from "@/components/providers";


export const metadata: Metadata = {
  title: "Sistema de Gestión de Residuos Hospitalarios",
  description:
    "Sistema integral para la gestión, trazabilidad y cumplimiento normativo de residuos hospitalarios",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
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
  );
}
