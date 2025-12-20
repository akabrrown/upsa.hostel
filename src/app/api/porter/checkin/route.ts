import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, studentId, roomId, notes } = body

    if (!action || !studentId) {
      return NextResponse.json(
        { error: 'Action and student ID are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'check_in':
        // Check in student
        const { error: checkInError } = await supabase
          .from('room_bookings')
          .update({ 
            status: 'checked_in',
            checked_in_at: new Date().toISOString(),
            check_in_notes: notes
          })
          .eq('student_id', studentId)
          .eq('status', 'active')

        if (checkInError) {
          return NextResponse.json(
            { error: 'Failed to check in student' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Student checked in successfully',
        })

      case 'check_out':
        // Check out student
        const { error: checkOutError } = await supabase
          .from('room_bookings')
          .update({ 
            status: 'checked_out',
            checked_out_at: new Date().toISOString(),
            check_out_notes: notes
          })
          .eq('student_id', studentId)
          .eq('status', 'checked_in')

        if (checkOutError) {
          return NextResponse.json(
            { error: 'Failed to check out student' },
            { status: 500 }
          )
        }

        // Update bed status to available
        const { data: booking } = await supabase
          .from('room_bookings')
          .select('bed_id')
          .eq('student_id', studentId)
          .single()

        if (booking?.bed_id) {
          await supabase
            .from('beds')
            .update({ is_occupied: false })
            .eq('id', booking.bed_id)
        }

        return NextResponse.json({
          message: 'Student checked out successfully',
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Check-in/out error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    const { data: bookings, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch check-in/out records' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      bookings,
    })

  } catch (error) {
    console.error('Fetch check-in/out records error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
