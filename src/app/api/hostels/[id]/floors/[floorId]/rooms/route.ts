import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, floorId: string } }
) {
  try {
    const hostelId = params.id
    const floorNumber = parseInt(params.floorId)

    const { data: rooms, error } = await supabaseAdmin
      .from('rooms')
      .select(`
        id,
        room_number,
        room_type,
        capacity,
        price_per_semester,
        is_active,
        floor_number,
        beds (
          id,
          bed_number,
          is_available
        )
      `)
      .eq('hostel_id', hostelId)
      .eq('floor_number', floorNumber)
      .order('room_number', { ascending: true })

    if (error) throw error

    const processedRooms = rooms?.map(room => ({
      id: room.id,
      roomNumber: room.room_number,
      roomType: room.room_type,
      capacity: room.capacity,
      floorId: params.floorId, // Virtual floor ID
      beds: room.beds
    }))

    return NextResponse.json({
      rooms: processedRooms,
      total: processedRooms?.length || 0
    })
  } catch (error) {
    console.error('Error fetching floor rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}
