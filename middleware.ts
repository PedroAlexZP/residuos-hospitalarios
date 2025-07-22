import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Temporarily disable middleware for testing login redirect
  console.log("Middleware - DISABLED for testing - Path:", req.nextUrl.pathname)
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|placeholder|.*\\.png|.*\\.svg|.*\\.jpg).*)"],
}
