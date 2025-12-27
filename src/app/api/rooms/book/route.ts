import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hostelId, floorId, roomId, bedId, academicYear, semester } = body

    // Get user from token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      request.cookies.get('sb-access-token')?.value
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Call the atomic booking function
    const { data: result, error: rpcError } = await supabaseAdmin
      .rpc('book_room_atomic', {
        p_user_id: user.id,
        p_room_id: roomId,
        p_bed_id: bedId,
        p_semester: semester,
        p_academic_year: academicYear
      })

    if (rpcError) {
      console.error('RPC Error:', rpcError)
      return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 })
    }

    // RPC returns JSON object with success, message, and data
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      message: result.message,
      data: result.data // Contains new accommodation_id
    })
    
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: 'Failed to complete booking' },
      { status: 500 }
    )
  }
}
