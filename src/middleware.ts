import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase'
import { addSecurityHeaders, handleCORS, getClientIP, isIPBlocked, detectBot } from '@/lib/security'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/']
const protectedRoutes = ['/student', '/admin', '/porter', '/director']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  // 1. Core Security Layer
  const ip = getClientIP(request)
  if (await isIPBlocked(ip)) {
    return new NextResponse('Access Denied', { status: 403 })
  }
  
  addSecurityHeaders(response)
  handleCORS(request, response)
  
  // Redirect HTTP to HTTPS in production
  if (process.env.NODE_ENV === 'production' && request.nextUrl.protocol === 'http') {
    const httpsUrl = new URL(request.url)
    httpsUrl.protocol = 'https'
    return NextResponse.redirect(httpsUrl)
  }

  // 2. Authentication & Authorization Layer
  const token = request.cookies.get('sb-access-token')?.value
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Handle Token-based checks
  if (token) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (!error && user) {
        const userRole = user.user_metadata?.role || 'student'

        // If on public route (excluding homepage), redirect to dashboard
        if (isPublicRoute && pathname !== '/') {
          const redirectMap: Record<string, string> = {
            student: '/student/dashboard',
            admin: '/admin/dashboard',
            porter: '/porter/dashboard',
            director: '/director/dashboard',
          }
          const dashboardUrl = redirectMap[userRole] || '/student/dashboard'
          return NextResponse.redirect(new URL(dashboardUrl, request.url))
        }

        // Check if user has access to the protected route they are on
        if (isProtectedRoute) {
          if (pathname.startsWith('/student') && userRole !== 'student') {
            return NextResponse.redirect(new URL('/login', request.url))
          }
          if (pathname.startsWith('/admin') && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/login', request.url))
          }
          if (pathname.startsWith('/porter') && userRole !== 'porter') {
            return NextResponse.redirect(new URL('/login', request.url))
          }
          if (pathname.startsWith('/director') && userRole !== 'director') {
            return NextResponse.redirect(new URL('/login', request.url))
          }
        }
      }
    } catch (err) {
      console.error('Middleware auth error:', err)
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
