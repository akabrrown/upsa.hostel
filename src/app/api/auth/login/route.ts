import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { loginSchema } from '@/lib/security/validation'
import { authRateLimiter, getClientId } from '@/lib/security/rateLimiting'
import { isAccountLocked, trackFailedLogin, clearFailedLoginAttempts, getClientIP } from '@/lib/security'

const LOCKOUT_DURATION_MINUTES = 15

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientId()
    const rateLimitResult = authRateLimiter.isAllowed('login:' + clientId)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toUTCString(),
          }
        }
      )
    }

    let body
    try {
      body = await request.json()
      console.log('Login API - Raw body received:', body)
    } catch (error) {
      console.error('Login API - JSON parsing error:', error)
      console.log('Login API - Request headers:', Object.fromEntries(request.headers.entries()))
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }
    
    const { email, password, role } = body

    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Check if account is locked
    const lockStatus = await isAccountLocked(email)
    if (lockStatus.isLocked) {
      return NextResponse.json(
        { 
          error: 'Account temporarily locked due to too many failed login attempts',
          lockoutUntil: lockStatus.lockoutUntil,
          message: `Please try again after ${lockStatus.lockoutUntil?.toLocaleTimeString()}`
        },
        { status: 423 } // 423 Locked
      )
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Track failed login attempt
      const ip = getClientIP(request)
      const userAgent = request.headers.get('user-agent') || 'unknown'
      const lockResult = await trackFailedLogin(email, ip, userAgent)
      
      if (lockResult.isLocked) {
        return NextResponse.json(
          { 
            error: 'Account locked due to too many failed login attempts',
            lockoutUntil: lockResult.lockoutUntil,
            message: `Your account has been locked for ${LOCKOUT_DURATION_MINUTES} minutes`
          },
          { status: 423 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          attemptsRemaining: lockResult.attemptsRemaining
        },
        { status: 401 }
      )
    }

    // Clear failed login attempts on successful login
    await clearFailedLoginAttempts(email)

    // Get user profile with role using Admin client to bypass RLS
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, role_id, index_number')
      .eq('id', data.user?.id || '')
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get role name
    const { data: roleData } = await supabaseAdmin
      .from('roles')
      .select('name')
      .eq('id', profile.role_id)
      .single()
      
    const userRole = roleData?.name || 'student'

    // Verify role matches if a role was claimed in the request
    if (role && userRole !== role) {
      return NextResponse.json(
        { error: 'Role mismatch' },
        { status: 403 }
      )
    }

    const response = NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        role: userRole,
        indexNumber: profile.index_number,
      },
      session: data.session,
      message: 'Login successful',
    })

    // Set auth cookie for middleware
    if (data.session?.access_token) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })
    }

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
