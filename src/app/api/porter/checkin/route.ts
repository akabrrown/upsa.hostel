import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, notes } = body

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    // Process check-in
    const { data: booking, error: checkInError } = await supabase
      .from('room_bookings')
      .update({ 
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        check_in_notes: notes
      })
      .eq('student_id', studentId)
      .eq('status', 'active')
      .select(`
        id,
        status,
        checked_in_at,
        checked_out_at,
        profiles (
          id,
          first_name,
          last_name,
          index_number
        ),
        rooms (
          room_number
        )
      `)
      .single()

    if (checkInError || !booking) {
      console.error('Check-in error:', checkInError)
      return NextResponse.json({ error: 'Failed to check in student' }, { status: 500 })
    }

    // Transform to camelCase
    const transformed = {
      id: booking.id,
      status: booking.status,
      checkInTime: booking.checked_in_at,
      checkOutTime: booking.checked_out_at,
      student: {
        id: (booking.profiles as any)?.id,
        firstName: (booking.profiles as any)?.first_name,
        lastName: (booking.profiles as any)?.last_name,
        indexNumber: (booking.profiles as any)?.index_number
      },
      room: {
        roomNumber: (booking.rooms as any)?.room_number
      }
    }

    return NextResponse.json({ data: transformed })

  } catch (error) {
    console.error('Check-in execution error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Keeping GET for backward compatibility or if specific room list is needed
  // But today-checkins is the preferred route now
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const roomId = searchParams.get('roomId')

    let query = supabase
      .from('room_bookings')
      .select(`
        *,
        students!inner(
          first_name,
          last_name,
          index_number,
          phone
        ),
        rooms(
          room_number,
          floors(
            floor_number,
            hostels(
              name,
              code
            )
          )
        )
      `)
      .order('booked_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (roomId) query = query.eq('room_id', roomId)

    const { data: bookings, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }

    return NextResponse.json({ bookings })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
