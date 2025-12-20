import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { roomReservationSchema } from '@/lib/security/validation'
import { bookingRateLimiter, getClientId } from '@/lib/security/rateLimiting'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientId()
    const rateLimitResult = bookingRateLimiter.isAllowed('reservation:' + clientId)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many reservation attempts' },
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
    const validation = roomReservationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const {
      hostelId,
      floorId,
      roomTypeId,
      academicYear,
      semester,
      specialRequests
    } = validation.data

    // Get user from session (you'd get this from auth header or session)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For now, we'll use a mock user ID
    const userId = 'mock-user-id'

    // Check if user already has a pending reservation
    const { data: existingReservation } = await supabase
      .from('room_reservations')
      .select('id')
      .eq('student_id', userId)
      .eq('status', 'pending')
      .single()

    if (existingReservation) {
      return NextResponse.json(
        { error: 'You already have a pending reservation' },
        { status: 409 }
      )
    }

    // Create reservation
    const { data: reservation, error } = await supabase
      .from('room_reservations')
      .insert({
        student_id: userId,
        hostel_id: hostelId,
        floor_id: floorId,
        room_type_id: roomTypeId,
        academic_year: academicYear,
        semester,
        special_requests: specialRequests,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create reservation' },
        { status: 500 }
      )
    }

    // Get hostel and room type details
    const { data: hostel } = await supabase
      .from('hostels')
      .select('name, code')
      .eq('id', hostelId)
      .single()

    const { data: roomType } = await supabase
      .from('room_types')
      .select('name, capacity, price_per_semester')
      .eq('id', roomTypeId)
      .single()

    return NextResponse.json({
      message: 'Reservation created successfully',
      reservation: {
        ...reservation,
        hostel,
        roomType,
      }
    })

  } catch (error) {
    console.error('Reservation error:', error)
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

    // Get user reservations
    const { data: reservations, error } = await supabase
      .from('room_reservations')
      .select('*, hostels(name, code), room_types(name, capacity, price_per_semester), floors(floor_number)')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch reservations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reservations,
    })

  } catch (error) {
    console.error('Fetch reservations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
