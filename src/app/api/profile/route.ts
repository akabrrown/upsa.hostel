import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

// Schema for profile update validation
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  phoneNumber: z.string().min(10, 'Phone number too short').max(15, 'Phone number too long').optional(),
  programOfStudy: z.string().min(1, 'Program is required').max(100, 'Program too long').optional(),
  yearOfStudy: z.number().min(1, 'Year must be at least 1').max(6, 'Year too high').optional(),
  indexNumber: z.string().min(1, 'Index number is required').max(20, 'Index number too long').optional(),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required').max(100, 'Name too long').optional(),
  emergencyContactPhone: z.string().min(10, 'Emergency phone too short').max(15, 'Phone too long').optional(),
  emergencyContactRelationship: z.string().min(1, 'Relationship is required').max(50, 'Relationship too long').optional(),
})

// Schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// GET /api/profile - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    // Get current user from cookie
    const token = request.cookies.get('sb-access-token')?.value || 
                  request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile based on role
    const userRole = user.user_metadata?.role
    
    // Get user profile data
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        users(email, index_number, roles(name))
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError) throw profileError

    // Get accommodations separately (they're linked to users, not profiles)
    const { data: accommodations } = await supabaseAdmin
      .from('accommodations')
      .select(`
        id,
        is_active,
        bed_number,
        room:rooms(
          room_number,
          room_type,
          price_per_semester,
          hostel:hostels(name, address)
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)

    // Get bookings
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        room:rooms(room_number, hostel:hostels(name))
      `)
      .eq('user_id', user.id)

    // Get reservations
    const { data: reservations } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('user_id', user.id)

    // Get payments
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        payment_methods(name)
      `)
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false })

    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: userRole,
          createdAt: user.created_at,
        },
        profile: {
          ...profileData,
          accommodation: accommodations?.[0] || null, // Get first active accommodation
          bookings: bookings || [],
          reservations: reservations || [],
          payments: payments || []
        },
      },
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Get current user from cookie
    const token = request.cookies.get('sb-access-token')?.value || 
                  request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    // Handle different update actions
    switch (action) {
      case 'profile':
        // Validate request body
        const validatedData = profileUpdateSchema.parse(body)
        
        // Update profile based on role
        const userRole = user.user_metadata?.role
        
        // Use profiles table for all roles
        const updateData = {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          phone_number: validatedData.phoneNumber,
          updated_at: new Date().toISOString(),
          ...(userRole === 'student' && {
            program: validatedData.programOfStudy,
            year_of_study: validatedData.yearOfStudy,
            student_id: validatedData.indexNumber,
            emergency_contact_name: validatedData.emergencyContactName,
            emergency_contact_phone: validatedData.emergencyContactPhone,
            emergency_contact_relationship: validatedData.emergencyContactRelationship,
          })
        }

        // Update profile in profiles table
        const { data: profile, error } = await supabaseAdmin
          .from('profiles')
          .update(updateData)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          message: 'Profile updated successfully',
          data: profile,
        })

      case 'password':
        // Validate password change
        const passwordData = passwordChangeSchema.parse(body)
        
        // Verify current password
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: passwordData.currentPassword,
        })

        if (verifyError) {
          return NextResponse.json(
            { error: 'Current password is incorrect' },
            { status: 400 }
          )
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: passwordData.newPassword,
        })

        if (updateError) {
          return NextResponse.json(
            { error: 'Failed to update password' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Password updated successfully',
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
