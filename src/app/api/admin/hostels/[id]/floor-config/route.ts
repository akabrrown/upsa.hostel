import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

// Schema for floor gender configuration
const floorGenderConfigSchema = z.record(
  z.string().regex(/^\d+$/, 'Floor number must be a number'),
  z.enum(['male', 'female', 'mixed'])
)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from Supabase Auth
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

    const hostelId = params.id
    const body = await request.json()
    
    // Validate floor gender configuration
    const floorConfig = floorGenderConfigSchema.parse(body.floorGenderConfig)

    // Get hostel to validate floor numbers
    const { data: hostel, error: hostelError } = await supabaseAdmin
      .from('hostels')
      .select('total_floors')
      .eq('id', hostelId)
      .single()

    if (hostelError || !hostel) {
      return NextResponse.json(
        { error: 'Hostel not found' },
        { status: 404 }
      )
    }

    // Validate floor numbers don't exceed total floors (allow 0 for ground floor)
    const floorNumbers = Object.keys(floorConfig).map(Number)
    const invalidFloors = floorNumbers.filter(floor => floor < 0 || floor > hostel.total_floors)
    
    if (invalidFloors.length > 0) {
      return NextResponse.json(
        { error: `Invalid floor numbers: ${invalidFloors.join(', ')}. Hostel has ${hostel.total_floors} floors.` },
        { status: 400 }
      )
    }

    // Update hostel floor gender configuration
    const { error: updateError } = await supabaseAdmin
      .from('hostels')
      .update({
        floor_gender_config: floorConfig,
        updated_at: new Date().toISOString()
      })
      .eq('id', hostelId)

    if (updateError) {
      throw updateError
    }

    // Update gender for all rooms on configured floors
    for (const [floor, gender] of Object.entries(floorConfig)) {
      const { error: roomUpdateError } = await supabaseAdmin
        .from('rooms')
        .update({ gender })
        .eq('hostel_id', hostelId)
        .eq('floor_number', parseInt(floor))

      if (roomUpdateError) {
        console.error(`Error updating rooms on floor ${floor}:`, roomUpdateError)
      }
    }

    return NextResponse.json({
      message: 'Floor gender configuration updated successfully',
      floorConfig
    })
  } catch (error) {
    console.error('Error updating floor gender config:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update floor gender configuration' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('GET /api/admin/hostels/[id]/floor-config hit, id:', params.id)
  try {
    const hostelId = params.id

    const { data: hostel, error } = await supabaseAdmin
      .from('hostels')
      .select('floor_gender_config, total_floors')
      .eq('id', hostelId)
      .single()

    if (error || !hostel) {
      return NextResponse.json(
        { error: 'Hostel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      floorGenderConfig: hostel.floor_gender_config || {},
      totalFloors: hostel.total_floors
    })
  } catch (error) {
    console.error('Error fetching floor gender config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch floor gender configuration' },
      { status: 500 }
    )
  }
}
