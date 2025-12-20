import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { roomBookingSchema } from '@/lib/security/validation'
import { bookingRateLimiter, getClientId } from '@/lib/security/rateLimiting'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientId()
    const rateLimitResult = bookingRateLimiter.isAllowed('booking:' + clientId)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many booking attempts' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toUTCString(),
          }
        }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = roomBookingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const {
      hostelId,
      floorId,
      roomId,
      bedId,
      academicYear,
      semester
    } = validation.data

    // Get user from session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mock user ID for now
    const userId = 'mock-user-id'

    // Check if bed is available
    const { data: bed, error: bedError } = await supabase
      .from('beds')
      .select('id, is_occupied, room_id')
      .eq('id', bedId)
      .single()

    if (bedError || !bed) {
      return NextResponse.json(
        { error: 'Bed not found' },
        { status: 404 }
      )
    }

    if (bed.is_occupied) {
      return NextResponse.json(
        { error: 'Bed is already occupied' },
        { status: 409 }
      )
    }

    // Verify bed belongs to specified room
    if (bed.room_id !== roomId) {
      return NextResponse.json(
        { error: 'Bed does not belong to specified room' },
        { status: 400 }
      )
    }

    // Create booking
    const { data: booking, error } = await supabase
      .from('room_bookings')
      .insert({
        student_id: userId,
        hostel_id: hostelId,
        floor_id: floorId,
        room_id: roomId,
        bed_id: bedId,
        academic_year: academicYear,
        semester,
        status: 'active',
        booked_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Update bed status
    const { error: updateError } = await supabase
      .from('beds')
      .update({ is_occupied: true })
      .eq('id', bedId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update bed status' },
        { status: 500 }
      )
    }

    // Get booking details
    const { data: bookingDetails } = await supabase
      .from('room_bookings')
      .select('*, hostels(name, code), rooms(room_number), beds(bed_number), floors(floor_number)')
      .eq('id', booking.id)
      .single()

    return NextResponse.json({
      message: 'Room booked successfully',
      booking: bookingDetails,
    })

  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user bookings
    const { data: bookings, error } = await supabase
      .from('room_bookings')
      .select('*, hostels(name, code), rooms(room_number), beds(bed_number), floors(floor_number)')
      .eq('student_id', userId)
      .order('booked_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      bookings,
    })

  } catch (error) {
    console.error('Fetch bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
