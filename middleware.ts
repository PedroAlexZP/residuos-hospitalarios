import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Helper functions to reduce cognitive complexity
const isPublicRoute = (pathname: string): boolean => {
  const publicPaths = ['/auth/login', '/auth/register', '/auth/reset-password', '/', '/api']
  return publicPaths.some(path => pathname === path || pathname.startsWith(path))
}

const isDashboardRoute = (pathname: string): boolean => {
  const dashboardPaths = ['/dashboard', '/usuarios', '/residuos', '/capacitaciones', '/entregas', '/incidencias', '/etiquetas', '/cumplimiento', '/reportes', '/pesaje', '/gestores-externos', '/normativas']
  return dashboardPaths.some(path => pathname.startsWith(path)) || pathname.includes('dashboard')
}

const createLoginRedirect = (baseUrl: string, pathname: string, error?: string): NextResponse => {
  const redirectUrl = new URL('/auth/login', baseUrl)
  if (error) redirectUrl.searchParams.set('error', error)
  redirectUrl.searchParams.set('redirect', pathname)
  return NextResponse.redirect(redirectUrl)
}

const handleSessionError = (req: NextRequest, error: any): NextResponse => {
  console.error('Session error in middleware:', error)
  return createLoginRedirect(req.url, req.nextUrl.pathname, 'session_error')
}

const handleInactiveUser = async (supabase: any, req: NextRequest): Promise<NextResponse> => {
  await supabase.auth.signOut()
  return createLoginRedirect(req.url, req.nextUrl.pathname, 'account_disabled')
}

const checkUserStatus = async (supabase: any, userId: string) => {
  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('activo, rol')
    .eq('id', userId)
    .single()

  if (userError && userError.code !== 'PGRST116') {
    console.error('User profile error in middleware:', userError)
    return { error: true }
  }

  return { userProfile, error: false }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Early return for public routes
  if (isPublicRoute(req.nextUrl.pathname)) {
    return res
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      return handleSessionError(req, sessionError)
    }

    // No session and trying to access protected route
    if (!session && isDashboardRoute(req.nextUrl.pathname)) {
      return createLoginRedirect(req.url, req.nextUrl.pathname)
    }

    // Handle authenticated users
    if (session) {
      const { userProfile, error } = await checkUserStatus(supabase, session.user.id)
      
      if (error) {
        return res // Continue on database error
      }

      // Inactive user
      if (userProfile && !userProfile.activo) {
        return handleInactiveUser(supabase, req)
      }

      // Redirect authenticated users away from auth pages
      if (req.nextUrl.pathname.startsWith('/auth/')) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // Redirect root to dashboard
      if (req.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return res
  } catch (error) {
    console.error('General middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|placeholder|robots.txt|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico).*)"],
}
