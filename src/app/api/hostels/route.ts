import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Schema for hostel validation
const hostelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  address: z.string().min(1, 'Address is required').max(200, 'Address too long'),
  description: z.string().optional(),
  gender: z.enum(['male', 'female', 'mixed']),
  totalFloors: z.number().min(1, 'At least 1 floor').max(10, 'Too many floors'),
  wardenName: z.string().min(1, 'Warden name is required').max(100, 'Warden name too long'),
  wardenEmail: z.string().email('Invalid email'),
  wardenPhone: z.string().min(10, 'Phone too short').max(15, 'Phone too long'),
  isActive: z.boolean().default(true),
  amenities: z.array(z.string()).optional(),
})

// GET /api/hostels - Fetch hostels with filters
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const gender = searchParams.get('gender')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('hostels')
      .select(`
        *,
        floors(
          id,
          floor_number,
          rooms_count
        ),
        rooms(
          id,
          room_number,
          room_type,
          capacity,
          monthly_fee,
          is_active
        )
      `)
      .order('name', { ascending: true })

    // Apply filters
    if (gender) {
      query = query.eq('gender', gender)
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: hostels, error, count } = await query

    if (error) {
      throw error
    }

    // Process hostels to include statistics
    const processedHostels = hostels?.map(hostel => ({
      ...hostel,
      totalRooms: hostel.rooms?.length || 0,
      totalBeds: hostel.rooms?.reduce((sum: number, room: any) => sum + room.capacity, 0) || 0,
      availableRooms: hostel.rooms?.filter((room: any) => room.is_active).length || 0,
      floors: hostel.floors?.length || 0,
    }))

    return NextResponse.json({
      data: processedHostels,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching hostels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hostels' },
      { status: 500 }
    )
  }
}

// POST /api/hostels - Create new hostel
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

    // Check if user has permission to create hostels
    const userRole = user.user_metadata?.role
    if (!['admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = hostelSchema.parse(body)

      // Check if hostel name already exists
    const { data: existingHostel, error: checkError } = await supabase
      .from('hostels')
      .select('id')
      .eq('name', validatedData.name)
      .single()

    if (existingHostel) {
      return NextResponse.json(
        { error: 'Hostel with this name already exists' },
        { status: 409 }
      )
    }

    // Create hostel
    const { data: hostel, error } = await supabase
      .from('hostels')
      .insert({
        ...validatedData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Create floors for the hostel
    const floors = Array.from({ length: validatedData.totalFloors }, (_, i) => ({
      hostel_id: hostel.id,
      floor_number: i + 1,
      created_at: new Date().toISOString(),
    }))

    const { error: floorsError } = await supabase
      .from('floors')
      .insert(floors)

    if (floorsError) {
      throw floorsError
    }

      return NextResponse.json({
      message: 'Hostel created successfully',
      data: hostel,
    })
  } catch (error) {
    console.error('Error creating hostel:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create hostel' },
      { status: 500 }
    )
  }
}

// PUT /api/hostels - Update hostel
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

    // Check if user has permission to update hostels
    const userRole = user.user_metadata?.role
    if (!['admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const hostelId = searchParams.get('id')

    if (!hostelId) {
      return NextResponse.json(
        { error: 'Hostel ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate request body (partial update)
    const validatedData = hostelSchema.partial().parse(body)

    // Update hostel
    const { data: hostel, error } = await supabase
      .from('hostels')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hostelId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Hostel updated successfully',
      data: hostel,
    })
  } catch (error) {
    console.error('Error updating hostel:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update hostel' },
      { status: 500 }
    )
  }
}

// DELETE /api/hostels - Delete hostel
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

    // Check if user has permission to delete hostels
    const userRole = user.user_metadata?.role
    if (!['admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const hostelId = searchParams.get('id')

    if (!hostelId) {
      return NextResponse.json(
        { error: 'Hostel ID is required' },
        { status: 400 }
      )
    }

    // Check if hostel has occupied rooms
    const { data: occupiedRooms, error: checkError } = await supabase
      .from('rooms')
      .select(`
        beds(
          id,
          is_available
        )
      `)
      .eq('hostel_id', hostelId)

    if (checkError) {
      throw checkError
    }

    if (occupiedRooms) {
      const hasOccupiedBeds = occupiedRooms.some((room: any) => 
        room.beds?.some((bed: any) => !bed.is_available)
      )

      if (hasOccupiedBeds) {
        return NextResponse.json(
          { error: 'Cannot delete hostel with occupied rooms' },
          { status: 400 }
        )
      }
    }

    // Delete in order: beds -> rooms -> floors -> hostel (foreign key constraints)
    // First get all room IDs for this hostel
    const { data: roomIds, error: roomIdsError } = await supabase
      .from('rooms')
      .select('id')
      .eq('hostel_id', hostelId)

    if (roomIdsError) {
      throw roomIdsError
    }

    // Delete beds for these rooms
    const { error: bedsError } = await supabase
      .from('beds')
      .delete()
      .in('room_id', roomIds?.map(room => room.id) || [])

    if (bedsError) {
      throw bedsError
    }

    const { error: roomsError } = await supabase
      .from('rooms')
      .delete()
      .eq('hostel_id', hostelId)

    if (roomsError) {
      throw roomsError
    }

    const { error: floorsError } = await supabase
      .from('floors')
      .delete()
      .eq('hostel_id', hostelId)

    if (floorsError) {
      throw floorsError
    }

    // Delete hostel
    const { error } = await supabase
      .from('hostels')
      .delete()
      .eq('id', hostelId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Hostel deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting hostel:', error)
    return NextResponse.json(
      { error: 'Failed to delete hostel' },
      { status: 500 }
    )
  }
}
