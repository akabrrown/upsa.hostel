import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, getSessionFromToken, logoutUser } from '@/lib/auth'
import { validateRequest, logAuditEvent, getClientIP } from '@/lib/security'
import { loginSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    // Validate request with security checks
    const validation = await validateRequest(request, {
      rateLimitType: 'auth',
      sanitizeInput: true,
      validateSchema: loginSchema,
    })

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error, errors: validation.data },
        { status: 400 }
      )
    }

    const { email, password, role } = validation.data!
    const ip = getClientIP(request)

    // Authenticate user
    const authResult = await authenticateUser(email, password, role)

    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: authResult.user,
      csrfToken: authResult.csrfToken,
    })

    // Set session cookie with security flags
    response.cookies.set('session', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })

    // Set CSRF token cookie (accessible to JavaScript)
    response.cookies.set('csrf-token', authResult.csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/',
    })

    return response

  } catch (error) {
    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''

    // Log failed login attempt
    await logAuditEvent({
      userId: 'unknown',
      action: 'login_failed',
      resource: 'auth',
      ipAddress: ip,
      userAgent,
      success: false,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Login failed' },
      { status: 401 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Validate request
    const validation = await validateRequest(request, {
      requireAuth: true,
      requireCSRF: true,
    })

    if (!validation.success || !validation.session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { sessionId, userId } = validation.session

    // Logout user
    await logoutUser(sessionId, userId)

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    })

    response.cookies.delete('session')
    response.cookies.delete('csrf-token')

    return response

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate request
    const validation = await validateRequest(request, {
      requireAuth: true,
    })

    if (!validation.success || !validation.session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { session } = validation

    // Return session info (without sensitive data)
    return NextResponse.json({
      success: true,
      session: {
        userId: session.userId,
        email: session.email,
        role: session.role,
        loginTime: session.loginTime,
        lastActivity: session.lastActivity,
      }
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Session validation failed' },
      { status: 500 }
    )
  }
}
