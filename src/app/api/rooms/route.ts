import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Schema for room validation
const roomSchema = z.object({
  hostelId: z.string().uuid('Invalid hostel ID'),
  floorNumber: z.number().min(1, 'Floor number must be at least 1').max(10, 'Floor number too high'),
  roomNumber: z.string().min(1, 'Room number is required').max(10, 'Room number too long'),
  roomType: z.enum(['single', 'double', 'triple', 'quadruple']),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(6, 'Capacity too high'),
  monthlyFee: z.number().min(0, 'Monthly fee must be positive'),
  gender: z.enum(['male', 'female', 'mixed']),
  isActive: z.boolean().default(true),
  amenities: z.array(z.string()).optional(),
})

// GET /api/rooms - Fetch rooms with filters
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const hostelId = searchParams.get('hostelId')
    const floorNumber = searchParams.get('floorNumber')
    const roomType = searchParams.get('roomType')
    const gender = searchParams.get('gender')
    const isActive = searchParams.get('isActive')
    const available = searchParams.get('available')

    // Build query
    let query = supabase
      .from('rooms')
      .select(`
        *,
        hostel:hostels(name, address, gender),
        beds(
          id,
          bed_number,
          is_available,
          current_student_id
        )
      `)
      .order('hostel_id', { ascending: true })
      .order('floor_number', { ascending: true })
      .order('room_number', { ascending: true })

    // Apply filters
    if (hostelId) {
      query = query.eq('hostel_id', hostelId)
    }
    if (floorNumber) {
      query = query.eq('floor_number', parseInt(floorNumber))
    }
    if (roomType) {
      query = query.eq('room_type', roomType)
    }
    if (gender) {
      query = query.eq('gender', gender)
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }
    if (available === 'true') {
      // Only show rooms with available beds
      query = query.gt('available_beds', 0)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: rooms, error, count } = await query

    if (error) {
      throw error
    }

    // Process rooms to include availability info
    const processedRooms = rooms?.map((room: any) => ({
      ...room,
      availableBeds: room.beds?.filter((bed: any) => bed.is_available).length || 0,
      occupiedBeds: room.beds?.filter((bed: any) => !bed.is_available).length || 0,
      totalBeds: room.beds?.length || 0,
    }))

    return NextResponse.json({
      data: processedRooms,
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

// POST /api/rooms - Create new room
export async function POST(request: NextRequest) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to create rooms
    const userRole = user.user_metadata?.role
    if (!['admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

      const body = await request.json()
      
      // Validate request body
      const validatedData = roomSchema.parse(body)

      // Check if hostel exists
      const { data: hostel, error: hostelError } = await supabase
        .from('hostels')
        .select('id')
        .eq('id', validatedData.hostelId)
        .single()

      if (hostelError || !hostel) {
        return NextResponse.json(
          { error: 'Hostel not found' },
          { status: 404 }
        )
      }

      // Check if room number already exists in this hostel and floor
      const { data: existingRoom, error: checkError } = await supabase
        .from('rooms')
        .select('id')
        .eq('hostel_id', validatedData.hostelId)
        .eq('floor_number', validatedData.floorNumber)
        .eq('room_number', validatedData.roomNumber)
        .single()

      if (existingRoom) {
        return NextResponse.json(
          { error: 'Room number already exists on this floor' },
          { status: 409 }
        )
      }

      // Create room
      const { data: room, error } = await supabase
        .from('rooms')
        .insert({
          ...validatedData,
          available_beds: validatedData.capacity,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Create beds for the room
      const beds = Array.from({ length: validatedData.capacity }, (_, i) => ({
        room_id: room.id,
        bed_number: `Bed ${i + 1}`,
        is_available: true,
        created_at: new Date().toISOString(),
      }))

      const { error: bedsError } = await supabase
        .from('beds')
        .insert(beds)

      if (bedsError) {
        throw bedsError
      }

      return NextResponse.json({
        message: 'Room created successfully',
        data: room,
      })
    } catch (error) {
      console.error('Error creating room:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create room' },
        { status: 500 }
      )
    }
  }

// PUT /api/rooms - Update room
export async function PUT(request: NextRequest) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to update rooms
    const userRole = user.user_metadata?.role
    if (!['admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('id')

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate request body (partial update)
    const validatedData = roomSchema.partial().parse(body)

    // Update room
    const { data: room, error } = await supabase
      .from('rooms')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Room updated successfully',
      data: room,
    })
  } catch (error) {
    console.error('Error updating room:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

// DELETE /api/rooms - Delete room
export async function DELETE(request: NextRequest) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to delete rooms
    const userRole = user.user_metadata?.role
    if (!['admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('id')

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    // Check if room has occupied beds
    const { data: occupiedBeds, error: checkError } = await supabase
      .from('beds')
      .select('id')
      .eq('room_id', roomId)
      .eq('is_available', false)

    if (occupiedBeds && occupiedBeds.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete room with occupied beds' },
        { status: 400 }
      )
    }

    // Delete beds first (foreign key constraint)
    const { error: bedsError } = await supabase
      .from('beds')
      .delete()
      .eq('room_id', roomId)

    if (bedsError) {
      throw bedsError
    }

    // Delete room
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Room deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}
