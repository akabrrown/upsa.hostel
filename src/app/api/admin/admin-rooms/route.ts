import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/admin/rooms - Fetch all rooms with hostel information
export async function GET(request: NextRequest) {
  console.log('GET /api/admin/rooms hit')
  try {
    const { searchParams } = new URL(request.url)
    const hostelId = searchParams.get('hostelId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    // Build query
    let query = supabaseAdmin
      .from('rooms')
      .select(`
        *,
        hostels (
          id,
          name,
          code
        )
      `)
      .order('created_at', { ascending: false })

    // Filter by hostel if specified
    if (hostelId) {
      query = query.eq('hostel_id', hostelId)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: rooms, error, count } = await query

    if (error) {
      throw error
    }

    // Transform data to match frontend Room interface
    const processedRooms = rooms?.map(room => ({
      id: room.id,
      roomNumber: room.room_number,
      hostel: (room.hostels as any)?.name || '',
      hostelId: room.hostel_id,
      floor: room.floor_number,
      type: room.room_type,
      capacity: room.capacity,
      occupied: room.current_occupancy || 0,
      available: (room.capacity || 0) - (room.current_occupancy || 0),
      status: room.is_maintenance ? 'maintenance' : (room.current_occupancy >= room.capacity ? 'occupied' : 'available'),
      condition: room.is_maintenance ? 'poor' : 'good', // Mocking condition/maintenance for now
      lastMaintenance: room.updated_at,
      nextMaintenance: new Date(new Date(room.updated_at).getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(), // +6 months
      occupants: [], // Will require another join if detailed
      amenities: room.amenities || [],
      monthlyRent: room.price_per_semester || 0,
      isActive: room.is_active,
    }))

    return NextResponse.json({
      rooms: processedRooms,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

// POST /api/admin/admin-rooms - Create new room(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const roomsToCreate = Array.isArray(body) ? body : [body]

    const results = []
    
    for (const roomData of roomsToCreate) {
      // Create room
      const { data: room, error: roomError } = await supabaseAdmin
        .from('rooms')
        .insert({
          hostel_id: roomData.hostelId,
          room_number: roomData.roomNumber,
          floor_number: parseInt(roomData.floorNumber),
          room_type: roomData.roomType || 'Double',
          capacity: parseInt(roomData.capacity),
          price_per_semester: parseFloat(roomData.pricePerSemester),
          amenities: roomData.amenities || [],
          is_active: roomData.isActive !== undefined ? roomData.isActive : true,
          is_maintenance: roomData.isMaintenance || false,
          gender: roomData.gender || 'mixed',
          current_occupancy: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (roomError) {
        console.error('Error creating room:', roomError)
        results.push({ success: false, roomNumber: roomData.roomNumber, error: roomError.message })
        continue
      }

      // Create beds for the room automatically
      const capacity = parseInt(roomData.capacity)
      const beds = Array.from({ length: capacity }, (_, i) => ({
        room_id: room.id,
        bed_number: `${roomData.roomNumber}-${i + 1}`,
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { error: bedsError } = await supabaseAdmin
        .from('beds')
        .insert(beds)

      if (bedsError) {
        console.error('Error creating beds:', bedsError)
        // We don't fail the whole request, but log it
      }

      results.push({ success: true, room: room })
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount

    if (successCount === 0 && failCount > 0) {
      return NextResponse.json({
        error: 'Registration failed for all rooms',
        details: results.map(r => `${r.roomNumber}: ${r.error}`)
      }, { status: 400 })
    }

    return NextResponse.json({
      message: successCount > 0 
        ? `Successfully created ${successCount} rooms.${failCount > 0 ? ` Failed ${failCount} rooms.` : ''}`
        : 'No rooms were created.',
      results
    }, { status: successCount > 0 ? 201 : 400 })

  } catch (error) {
    console.error('Error creating rooms:', error)
    return NextResponse.json(
      { error: 'Failed to create rooms' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/admin-rooms - Update room
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('id')
    const body = await request.json()

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    const { data: room, error } = await supabaseAdmin
      .from('rooms')
      .update({
        room_number: body.roomNumber,
        hostel_id: body.hostelId,
        floor_number: parseInt(body.floorNumber),
        room_type: body.roomType,
        capacity: parseInt(body.capacity),
        price_per_semester: parseFloat(body.pricePerSemester),
        is_maintenance: body.isMaintenance,
        gender: body.gender,
        amenities: body.amenities,
        is_active: body.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: 'Room updated successfully', room })
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
}

// DELETE /api/admin/admin-rooms - Delete room
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('id')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Delete beds first (FK constraint)
    const { error: bedsError } = await supabaseAdmin
      .from('beds')
      .delete()
      .eq('room_id', roomId)

    if (bedsError) console.warn('Beds deletion error:', bedsError)

    // Delete room
    const { error } = await supabaseAdmin
      .from('rooms')
      .delete()
      .eq('id', roomId)

    if (error) throw error

    return NextResponse.json({ message: 'Room deleted successfully' })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
}
