import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    // Build query with room counts
    let query = supabaseAdmin
      .from('hostels')
      .select(`
        *,
        rooms (
          *
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

    // Process hostels to match frontend interface
    const processedHostels = hostels?.map(hostel => {
      const rooms = (hostel.rooms as any[]) || []
      const totalRooms = rooms.length
      const totalBeds = rooms.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0)
      const occupiedBeds = rooms.reduce((sum: number, r: any) => sum + (r.current_occupancy || 0), 0)
      
      return {
        id: hostel.id,
        name: hostel.name,
        code: hostel.code,
        address: hostel.address || '',
        totalFloors: hostel.total_floors || 1,
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds: totalBeds - occupiedBeds,
        warden: hostel.warden_name || '',
        contact: hostel.warden_phone || hostel.warden_email || '',
        status: hostel.is_active ? 'active' : 'inactive',
        createdAt: hostel.created_at,
        pricePerSemester: hostel.room_pricing?.single || 0,
        pricePerYear: (hostel.room_pricing?.single || 0) * 2,
        gender: (hostel.gender?.charAt(0).toUpperCase() + hostel.gender?.slice(1)) as 'Male' | 'Female' | 'Mixed',
        amenities: hostel.amenities || [],
        description: hostel.description || '',
        roomPricing: hostel.room_pricing || { single: 0, double: 0, quadruple: 0 }
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

    // Generate hostel code from name (first 3-4 letters uppercase + random number)
    const codeBase = validatedData.name
      .replace(/[^a-zA-Z]/g, '')
      .substring(0, 4)
      .toUpperCase()
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const hostelCode = `${codeBase}${randomNum}`

    // Create hostel
    const { data: hostel, error } = await supabaseAdmin
      .from('hostels')
      .insert({
        name: validatedData.name,
        code: hostelCode,
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

    // Floors are implicitly handled by total_floors and room assignments
    // No separate floors table insertion needed

    return NextResponse.json({
      message: 'Hostel created successfully',
      data: hostel,
    })
  } catch (error) {
    console.error('Error creating hostel:', error)
    
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', JSON.stringify(error.errors, null, 2))
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
    const { data: hostel, error } = await supabaseAdmin
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
    const { data: occupiedRooms, error: checkError } = await supabaseAdmin
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
    const { data: roomIds, error: roomIdsError } = await supabaseAdmin
      .from('rooms')
      .select('id')
      .eq('hostel_id', hostelId)

    if (roomIdsError) {
      throw roomIdsError
    }

    // Delete beds for these rooms
    const { error: bedsError } = await supabaseAdmin
      .from('beds')
      .delete()
      .in('room_id', roomIds?.map(room => room.id) || [])

    if (bedsError) {
      throw bedsError
    }

    const { error: roomsError } = await supabaseAdmin
      .from('rooms')
      .delete()
      .eq('hostel_id', hostelId)

    if (roomsError) {
      throw roomsError
    }

    const { error: floorsError } = await supabaseAdmin
      .from('floors')
      .delete()
      .eq('hostel_id', hostelId)

    if (floorsError) {
      throw floorsError
    }

    // Delete hostel
    const { error } = await supabaseAdmin
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
