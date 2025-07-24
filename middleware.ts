import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/auth/login', '/auth/register', '/', '/api']
  const isPublicPath = publicPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  // Si es una ruta pública, permitir acceso
  if (isPublicPath) {
    return res
  }

  try {
    // Verificar autenticación
    const { data: { session } } = await supabase.auth.getSession()

    // Si no hay sesión y no es ruta pública, redirigir a login
    if (!session && !isPublicPath) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // En caso de error, permitir continuar para evitar loops
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (png, jpg, svg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|placeholder|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)"],
}
