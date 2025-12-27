import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, floorId: string, roomId: string } }
) {
  try {
    const { data: room, error } = await supabaseAdmin
      .from('rooms')
      .select(`
        *,
        beds (
          id,
          bed_number,
          room_id,
          is_available,
          current_student_id
        )
      `)
      .eq('id', params.roomId)
      .single()

    if (error) throw error

    // Transform to match frontend expectations if necessary
    const processedRoom = {
      ...room,
      roomNumber: room.room_number,
      roomType: room.room_type,
      beds: room.beds?.map((bed: any) => ({
        id: bed.id,
        bedNumber: bed.bed_number,
        roomId: bed.room_id,
        isOccupied: !bed.is_available,
        studentName: bed.current_student_id ? 'Occupied' : undefined // Basic privacy
      }))
    }

    return NextResponse.json({
      room: processedRoom
    })
  } catch (error) {
    console.error('Error fetching room details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room details' },
      { status: 500 }
    )
  }
}
