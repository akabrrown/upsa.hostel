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
  
  addSecurityHeaders(request, response)
  handleCORS(request, response)
  
  // Redirect HTTP to HTTPS in production, but exclude localhost/127.0.0.1
  const host = request.headers.get('host') || ''
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
  
  if (process.env.NODE_ENV === 'production' && !isLocal && request.nextUrl.protocol === 'http') {
    const httpsUrl = new URL(request.url)
    httpsUrl.protocol = 'https'
    return NextResponse.redirect(httpsUrl)
  }

  // 2. Authentication & Authorization Layer
  const token = request.cookies.get('sb-access-token')?.value
  
  // Refined route matching to avoid catching everything with '/'
  const isPublicRoute = publicRoutes.some(route => 
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  )
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

      if (error || !user) {
        // Token is invalid or expired
        if (isProtectedRoute) {
          const loginUrl = new URL('/login', request.url)
          const response = NextResponse.redirect(loginUrl)
          response.cookies.delete('sb-access-token')
          return response
        }
        return response
      }

      const userRole = user.user_metadata?.role || 'student'
      const redirectMap: Record<string, string> = {
        student: '/student/dashboard',
        admin: '/admin/dashboard',
        porter: '/porter/dashboard',
        director: '/director/dashboard',
      }

      // If on public route (excluding homepage and login), redirect to THEIR dashboard
      if (isPublicRoute && pathname !== '/' && pathname !== '/login') {
        const dashboardUrl = redirectMap[userRole] || '/student/dashboard'
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }

      // Check if user has access to the protected route they are on
      if (isProtectedRoute) {
        const allowedPrefix = `/${userRole}`
        if (!pathname.startsWith(allowedPrefix)) {
          // Redirect to their own dashboard instead of login to avoid loops
          const dashboardUrl = redirectMap[userRole] || '/student/dashboard'
          return NextResponse.redirect(new URL(dashboardUrl, request.url))
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
