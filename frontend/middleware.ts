import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/auth/login", "/auth/register", "/auth/reset-password"]
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Si no hay sesión y no es ruta pública, redirigir a login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // Si hay sesión y está en ruta de auth, redirigir al dashboard
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Verificar permisos por rol para rutas específicas
  if (session) {
    try {
      const { data: user } = await supabase.from("users").select("rol").eq("id", session.user.id).single()

      if (user) {
        const userRole = user.rol
        const pathname = req.nextUrl.pathname

        // Rutas restringidas por rol
        const adminOnlyRoutes = ["/admin", "/usuarios", "/permisos"]
        const supervisorRoutes = ["/reportes", "/cumplimiento"]

        if (adminOnlyRoutes.some((route) => pathname.startsWith(route)) && userRole !== "admin") {
          return NextResponse.redirect(new URL("/dashboard", req.url))
        }

        if (
          supervisorRoutes.some((route) => pathname.startsWith(route)) &&
          !["supervisor", "admin"].includes(userRole)
        ) {
          return NextResponse.redirect(new URL("/dashboard", req.url))
        }
      }
    } catch (error) {
      console.error("Error checking user permissions in middleware:", error)
      // Continue without blocking if there's an error
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
