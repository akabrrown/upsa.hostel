import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hostelId = searchParams.get('hostelId')
    const floorNumber = searchParams.get('floorNumber')

    if (!hostelId) {
      return NextResponse.json({ error: 'Hostel ID is required' }, { status: 400 })
    }

    let query = supabaseAdmin
      .from('rooms')
      .select('id, room_number, current_occupancy, capacity, room_type')
      .eq('hostel_id', hostelId)

    if (floorNumber) {
      query = query.eq('floor_number', floorNumber)
    }

    const { data: rooms, error } = await query.order('room_number', { ascending: true })

    if (error) {
      console.error('Error fetching rooms:', error)
      return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
    }

    // Double check capacity in JS just to be safe
    const availableRooms = rooms?.filter(room => room.current_occupancy < room.capacity) || []

    return NextResponse.json({ rooms: availableRooms })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
