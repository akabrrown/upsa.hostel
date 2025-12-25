import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/hostels/[id] - Fetch a specific hostel by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hostelId = params.id

    // Fetch hostel with related data
    const { data: hostel, error } = await supabase
      .from('hostels')
      .select('*')
      .eq('id', hostelId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Hostel not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Process hostel data to match About Hostel page structure
    // Generate mock data for demonstration since we don't have room relationships
    const totalRooms = Math.floor(Math.random() * 20) + 10
    const availableRooms = Math.floor(Math.random() * totalRooms)
    const monthlyFee = Math.floor(Math.random() * 500) + 200

    const processedHostel = {
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
      gender: hostel.gender,
      wardenName: hostel.warden_name,
      wardenEmail: hostel.warden_email,
      wardenPhone: hostel.warden_phone,
    }

    return NextResponse.json({
      data: processedHostel,
    })
  } catch (error) {
    console.error('Error fetching hostel:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hostel' },
      { status: 500 }
    )
  }
}
