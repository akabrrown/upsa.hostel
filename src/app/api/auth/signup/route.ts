import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { signupSchema } from '@/lib/security/validation'
import { authRateLimiter, getClientId } from '@/lib/security/rateLimiting'

export async function POST(request: NextRequest) {
  try {
    // Temporarily disable rate limiting for testing
    // const clientId = getClientId()
    // const rateLimitResult = authRateLimiter.isAllowed('signup:' + clientId)
    
    // if (!rateLimitResult.allowed) {
    //   return NextResponse.json(
    //     { error: 'Too many signup attempts' },
    //     { 
    //       status: 429,
    //       headers: {
    //         'X-RateLimit-Limit': '5',
    //         'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    //         'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toUTCString(),
    //       }
    //     }
    //   )
    // }

    const body = await request.json()
    console.log('Received signup request body:', JSON.stringify(body, null, 2))
    
    // Validate input
    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      console.error('Validation error details:', validation.error.errors)
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const {
      firstName,
      lastName,
      indexNumber: rawIndexNumber,
      dateOfBirth,
      phone,
      email,
      programOfStudy,
      yearOfStudy,
      emergencyContact
    } = validation.data

    // Ensure index number is prefixed for the database
    const indexNumber = rawIndexNumber.toUpperCase().startsWith('UPSA') 
      ? rawIndexNumber.toUpperCase() 
      : `UPSA${rawIndexNumber}`

    // Set default values for missing fields
    const phoneNumber = phone || ''
    const userRole = 'student' // Default role for all signups

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check if index number already exists
    const { data: existingIndex } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('index_number', indexNumber)
      .single()

    if (existingIndex) {
      return NextResponse.json(
        { error: 'Index number already registered' },
        { status: 409 }
      )
    }

    // Get role ID (default to 'student')
    console.log('Looking up role:', userRole)
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', userRole)
      .single()

    console.log('Role lookup result:', { roleData, roleError })

    if (!roleData) {
      console.error('Role not found:', userRole)
      return NextResponse.json(
        { error: 'Role not found', details: roleError },
        { status: 500 }
      )
    }

    // Create user in Supabase Auth first
    console.log('Creating Supabase Auth user:', email)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: dateOfBirth.replace(/-/g, ''), // Default password is DoB
      email_confirm: true,
      user_metadata: {
        index_number: indexNumber,
        role: userRole
      }
    })

    if (authError || !authUser?.user) {
      console.error('Auth user creation failed:', authError)
      return NextResponse.json(
        { error: 'Failed to create authentication account', details: authError?.message },
        { status: 500 }
      )
    }

    const userId = authUser.user.id
    console.log('Auth user created with ID:', userId)

    // Create user in public database
    const bcrypt = require('bcryptjs')
    const defaultPassword = dateOfBirth.replace(/-/g, '')
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    console.log('Creating public user record...')
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId, // CRITICAL: Link public user to auth user
        email,
        password_hash: hashedPassword, // Keep for legacy/backup, but Auth handles login
        index_number: indexNumber,
        role_id: roleData.id,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (userError) {
      console.error('Public user creation failed:', userError)
      // Rollback: Delete the auth user if public record fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      
      return NextResponse.json(
        { error: 'Failed to create user record', details: userError.message },
        { status: 500 }
      )
    }

    console.log('Public user created successfully')

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        first_name: firstName || rawIndexNumber,
        last_name: lastName || '',
        date_of_birth: dateOfBirth,
        phone_number: phoneNumber,
        student_id: indexNumber,
        program: programOfStudy || null,
        year_of_study: yearOfStudy || null,
        emergency_contact_name: emergencyContact?.name || null,
        emergency_contact_phone: emergencyContact?.phone || null,
        emergency_contact_relationship: emergencyContact?.relationship || null,
        created_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile creation failed:', profileError)
      // Rollback: Delete both auth user and public user
      await supabaseAdmin.from('users').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)

      return NextResponse.json(
        { error: 'Failed to create user profile', details: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: userData.id,
        email,
        indexNumber,
        role: userRole,
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
