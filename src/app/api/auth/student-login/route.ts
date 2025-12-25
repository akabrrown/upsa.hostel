import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { loginSchema } from '@/lib/security/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Student Login API - Raw body received:', body)
    const { indexNumber, dateOfBirth } = body

    // Validate input
    if (!indexNumber || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Index number and date of birth are required' },
        { status: 400 }
      )
    }

    // Generate email from index number
    const email = `${indexNumber}@upsamail.edu.gh`
    const password = dateOfBirth.replace(/-/g, '') // Remove dashes from YYYY-MM-DD

    console.log('Student Login API - Generated email:', email)
    console.log('Student Login API - Generated password:', password)

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Student Login API - Auth error:', error)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Student Login API - Auth success:', data.user?.id)

    // Get user profile with role using Admin client to bypass RLS
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, role_id, index_number')
      .eq('id', data.user?.id || '')
      .single()

    if (profileError || !profile) {
      console.error('Student Login API - Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    console.log('Student Login API - Profile found:', profile)

    // Get role name
    const { data: roleData } = await supabaseAdmin
      .from('roles')
      .select('name')
      .eq('id', profile.role_id)
      .single()
      
    const userRole = roleData?.name || 'student'
    console.log('Student Login API - User role:', userRole)

    const response = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        role: userRole,
        indexNumber: profile.index_number,
      },
      token: data.session?.access_token,
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
    console.error('Student Login API - Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
