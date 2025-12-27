import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hostelId = params.id

    const { data: hostel, error } = await supabaseAdmin
      .from('hostels')
      .select('total_floors')
      .eq('id', hostelId)
      .single()

    if (error) throw error

    // Generate floors list based on total_floors
    const floors = Array.from({ length: hostel.total_floors || 0 }, (_, i) => ({
      id: `${i + 1}`,
      floorNumber: i + 1,
      hostelId: hostelId
    }))

    return NextResponse.json({
      floors: floors,
      total: floors.length
    })
  } catch (error) {
    console.error('Error fetching floors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch floors' },
      { status: 500 }
    )
  }
}
