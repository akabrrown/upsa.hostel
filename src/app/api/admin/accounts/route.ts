import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { adminUserSchema } from '@/lib/security/validation'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        index_number,
        is_active,
        created_at,
        last_login,
        role_id,
        roles (
          name
        ),
        profiles (
          first_name,
          last_name,
          phone_number,
          student_id
        )
      `)

    if (role && role !== 'all') {
      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', role)
        .single()
      
      if (roleData) {
        query = query.eq('role_id', roleData.id)
      }
    }

    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active')
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,index_number.ilike.%${search}%`)
    }

    const { data: users, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching accounts:', error)
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: (user.profiles as any)?.[0]?.first_name || '',
      lastName: (user.profiles as any)?.[0]?.last_name || '',
      role: (user.roles as any)?.name || 'student',
      indexNumber: user.index_number || '',
      phone: (user.profiles as any)?.[0]?.phone_number || '',
      status: user.is_active ? 'active' : 'inactive',
      lastLogin: user.last_login || 'Never',
      createdAt: user.created_at,
      isLocked: !user.is_active
    }))

    return NextResponse.json(transformedUsers)

  } catch (error) {
    console.error('Admin accounts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = adminUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, role, phone, indexNumber } = validation.data
    const defaultPassword = 'Welcome@2025' // Default password for new accounts

    // 1. Get role ID
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', role)
      .single()

    if (roleError || !roleData) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // 2. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        firstName,
        lastName,
        role
      }
    })

    if (authError || !authUser?.user) {
      console.error('Auth creation error:', authError)
      return NextResponse.json(
        { error: authError?.message || 'Failed to create auth account' },
        { status: 500 }
      )
    }

    const userId = authUser.user.id

    // 3. Create Public User Record
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        password_hash: hashedPassword,
        role_id: roleData.id,
        index_number: indexNumber || null,
        is_active: true,
        email_verified: true,
      })

    if (userError) {
      console.error('Public user creation error:', userError)
      // Rollback
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 })
    }

    // 4. Create Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone || '',
        student_id: indexNumber || null,
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Rollback
      await supabaseAdmin.from('users').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: userId,
        email,
        role,
        firstName,
        lastName
      }
    })

  } catch (error) {
    console.error('Admin accounts POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
