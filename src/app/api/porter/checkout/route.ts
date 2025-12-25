import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, notes } = body

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    // Process check-out
    const { data: booking, error: checkOutError } = await supabase
      .from('room_bookings')
      .update({ 
        status: 'checked_out',
        checked_out_at: new Date().toISOString(),
        check_out_notes: notes
      })
      .eq('student_id', studentId)
      .eq('status', 'checked_in')
      .select(`
        id,
        status,
        checked_in_at,
        checked_out_at,
        bed_id,
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

    if (checkOutError || !booking) {
      console.error('Check-out error:', checkOutError)
      return NextResponse.json({ error: 'Failed to check out student' }, { status: 500 })
    }

    // Mark bed as available
    if (booking.bed_id) {
      await supabase
        .from('beds')
        .update({ is_occupied: false })
        .eq('id', booking.bed_id)
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
    console.error('Check-out execution error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
