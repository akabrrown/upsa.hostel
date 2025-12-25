import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: bookings, error } = await supabase
      .from('room_bookings')
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
      .gte('checked_in_at', today.toISOString())
      .order('checked_in_at', { ascending: false })

    if (error) {
      console.error('Fetch today checkins error:', error)
      return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 })
    }

    // Transform to camelCase
    const transformed = (bookings || []).map((b: any) => ({
      id: b.id,
      status: b.status,
      checkInTime: b.checked_in_at,
      checkOutTime: b.checked_out_at,
      student: {
        id: (b.profiles as any)?.id,
        firstName: (b.profiles as any)?.first_name,
        lastName: (b.profiles as any)?.last_name,
        indexNumber: (b.profiles as any)?.index_number
      },
      room: {
        roomNumber: (b.rooms as any)?.room_number
      }
    }))

    return NextResponse.json({ data: transformed })

  } catch (error) {
    console.error('Today checkins error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
