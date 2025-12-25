import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Create service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
import { z } from 'zod'

// Schema for hostel validation with room type pricing
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
  roomPricing: z.object({
    single: z.number().min(0, 'Single room price must be positive'),
    double: z.number().min(0, 'Double room price must be positive'),
    quadruple: z.number().min(0, 'Quadruple room price must be positive')
  })
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
    let query = supabaseAdmin
      .from('hostels')
      .select('*')
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

    // Process hostels to include statistics and match About Hostel page structure
    const processedHostels = hostels?.map(hostel => {
      // Generate mock data for demonstration since we don't have room relationships
      const totalRooms = Math.floor(Math.random() * 20) + 10
      const availableRooms = Math.floor(Math.random() * totalRooms)
      const monthlyFee = Math.floor(Math.random() * 500) + 200
      
      return {
        id: hostel.id,
        name: hostel.name,
        description: hostel.description || 'Modern accommodation facility with excellent amenities',
        address: hostel.address,
        total_rooms: totalRooms,
        available_rooms: availableRooms,
        monthly_fee: monthlyFee,
        amenities: hostel.amenities || ['WiFi', 'Security', 'Parking'],
        images: [], // Can be added later
        rating: 4.5, // Can be calculated from reviews later
        status: hostel.is_active ? 'active' : 'inactive',
        created_at: hostel.created_at,
        // Additional fields for compatibility
        totalRooms: totalRooms,
        totalBeds: totalRooms * 2, // Assume 2 beds per room
        floors: hostel.total_floors || 3,
      }
    })

    return NextResponse.json({
      hostels: processedHostels,
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
    // Get user from Supabase Auth using the cookie
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      request.cookies.get('sb-access-token')?.value
    )
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get user's role from the database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        role_id,
        roles!inner (
          name
        )
      `)
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    const userRole = (userData as any).roles?.name
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = hostelSchema.parse(body)

    // Check if hostel name already exists
    const { data: existingHostel, error: checkError } = await supabaseAdmin
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
    const { data: hostel, error } = await supabaseAdmin
      .from('hostels')
      .insert({
        name: validatedData.name,
        address: validatedData.address,
        description: validatedData.description,
        gender: validatedData.gender,
        total_floors: validatedData.totalFloors,
        warden_name: validatedData.wardenName,
        warden_email: validatedData.wardenEmail,
        warden_phone: validatedData.wardenPhone,
        is_active: validatedData.isActive,
        amenities: validatedData.amenities,
        room_pricing: validatedData.roomPricing,
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

    const { error: floorsError } = await supabaseAdmin
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
