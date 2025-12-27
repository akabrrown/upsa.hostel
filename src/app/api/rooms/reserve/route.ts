import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hostelId, floorId, roomTypeId, academicYear, semester, specialRequests } = body

    // Get user from token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      request.cookies.get('sb-access-token')?.value
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Check if user already has an active accommodation for this period
    const { data: existingAcc } = await supabaseAdmin
      .from('accommodations')
      .select('id')
      .eq('user_id', user.id)
      .eq('academic_year', academicYear)
      .eq('semester', semester)
      .eq('is_active', true)
      .maybeSingle()

    if (existingAcc) {
      return NextResponse.json({ error: 'You already have an active accommodation for this semester' }, { status: 400 })
    }

    // 2. Check for pending or approved bookings for this period
    const { data: existingBooking } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('user_id', user.id)
      .eq('academic_year', academicYear)
      .eq('semester', semester)
      .in('status', ['Pending', 'Approved'])
      .maybeSingle()

    if (existingBooking) {
      return NextResponse.json({ error: 'You already have a pending or approved booking for this semester' }, { status: 400 })
    }

    // 3. Check for pending or approved reservations for this period
    const { data: existingReservation } = await supabaseAdmin
      .from('reservations')
      .select('id')
      .eq('user_id', user.id)
      .eq('academic_year', academicYear)
      .eq('semester', semester)
      .in('status', ['Pending', 'Approved', 'Confirmed'])
      .maybeSingle()

    if (existingReservation) {
      return NextResponse.json({ error: 'You already have a pending or approved reservation for this semester' }, { status: 400 })
    }

    // Create reservation record
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .insert({
        user_id: user.id,
        room_id: null, // Reservations don't have specific room assigned yet
        semester: semester,
        academic_year: academicYear,
        status: 'Pending',
        reservation_reference: `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        reservation_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days expiry
        
        // Save Preferences
        preferred_hostel_id: hostelId,
        preferred_floor_id: floorId,
        preferred_room_type_id: roomTypeId,
        special_requests: specialRequests,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: 'Reservation submitted successfully',
      data: data
    })
  } catch (error) {
    console.error('Reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit reservation' },
      { status: 500 }
    )
  }
}
