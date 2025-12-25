import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/hostels/[id]/rooms - Fetch rooms for a specific hostel
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hostelId = params.id

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const roomType = searchParams.get('type')
    const available = searchParams.get('available')

    // Build query
    let query = supabase
      .from('rooms')
      .select(`
        id,
        room_number,
        room_type,
        capacity,
        monthly_fee,
        is_active,
        floor_number,
        beds (
          id,
          bed_number,
          is_available
        )
      `)
      .eq('hostel_id', hostelId)
      .order('room_number', { ascending: true })

    // Apply filters
    if (roomType) {
      query = query.eq('room_type', roomType)
    }
    if (available === 'true') {
      query = query.eq('is_active', true)
    }

    const { data: rooms, error } = await query

    if (error) {
      throw error
    }

    // Process rooms to include bed information
    const processedRooms = rooms?.map(room => ({
      id: room.id,
      room_number: room.room_number,
      room_type: room.room_type,
      capacity: room.capacity,
      monthly_fee: room.monthly_fee,
      is_active: room.is_active,
      floor_number: room.floor_number,
      total_beds: room.beds?.length || 0,
      available_beds: room.beds?.filter((bed: any) => bed.is_available).length || 0,
      occupied_beds: room.beds?.filter((bed: any) => !bed.is_available).length || 0,
    }))

    return NextResponse.json({
      rooms: processedRooms,
      total: processedRooms?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching hostel rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hostel rooms' },
      { status: 500 }
    )
  }
}
