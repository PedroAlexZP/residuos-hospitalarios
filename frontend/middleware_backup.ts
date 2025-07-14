import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ["/auth/login", "/auth/register", "/auth/reset-password"]
    const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
    
    // Redirect root to appropriate page
    if (req.nextUrl.pathname === "/") {
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      } else {
        return NextResponse.redirect(new URL("/auth/login", req.url))
      }
    }

    // Si no hay sesión y no es ruta pública, redirigir a login
    if (!session && !isPublicRoute) {
      const loginUrl = new URL("/auth/login", req.url)
      // Add return URL for better UX
      loginUrl.searchParams.set("returnUrl", req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Si hay sesión y está en ruta de auth, redirigir al dashboard
    if (session && isPublicRoute) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Basic role checking from user metadata
    if (session) {
      const userRole = session.user?.user_metadata?.rol
      const pathname = req.nextUrl.pathname

      // Rutas restringidas por rol (simplificado)
      const adminOnlyRoutes = ["/admin", "/usuarios", "/permisos"]
      const supervisorRoutes = ["/reportes", "/cumplimiento"]

      if (adminOnlyRoutes.some((route) => pathname.startsWith(route)) && userRole !== "admin") {
        return NextResponse.redirect(new URL("/dashboard?error=insufficient_permissions", req.url))
      }

      if (
        supervisorRoutes.some((route) => pathname.startsWith(route)) &&
        !["supervisor", "admin"].includes(userRole)
      ) {
        return NextResponse.redirect(new URL("/dashboard?error=insufficient_permissions", req.url))
      }
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|placeholder|.*\\.png|.*\\.svg|.*\\.jpg).*)"],
}

          const userRole = user.rol
          const pathname = req.nextUrl.pathname

          // Rutas restringidas por rol
          const adminOnlyRoutes = ["/admin", "/usuarios", "/permisos"]
          const supervisorRoutes = ["/reportes", "/cumplimiento"]

          if (adminOnlyRoutes.some((route) => pathname.startsWith(route)) && userRole !== "admin") {
            return NextResponse.redirect(new URL("/dashboard?error=insufficient_permissions", req.url))
          }

          if (
            supervisorRoutes.some((route) => pathname.startsWith(route)) &&
            !["supervisor", "admin"].includes(userRole)
          ) {
            return NextResponse.redirect(new URL("/dashboard?error=insufficient_permissions", req.url))
          }
        }
      } catch (error) {
        console.error("Error checking user permissions in middleware:", error)
        // Continue without blocking if there's an error
      }
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|placeholder|.*\\.png|.*\\.svg|.*\\.jpg).*)"],
}
