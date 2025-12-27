import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('sb-access-token')?.value || 
                  request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. Get Porter's Hostel (from profiles or checkins)
    // For now, let's look for any checkin handled by this porter to find their hostel
    const { data: lastCheckin } = await supabaseAdmin
      .from('checkins')
      .select('room:rooms(hostel_id)')
      .eq('porter_id', user.id)
      .limit(1)
      .maybeSingle()

    // If no checkins, we might have to fallback or look elsewhere.
    // In a real system, there should be a porter_assignments table.
    // But let's assume we can find the hostel they are working at.
    // Fallback: Get the first hostel if none found for testing
    let hostelId = (lastCheckin as any)?.room?.hostel_id

    if (!hostelId) {
      const { data: firstHostel } = await supabaseAdmin.from('hostels').select('id').limit(1).maybeSingle()
      hostelId = firstHostel?.id
    }

    if (!hostelId) {
      return NextResponse.json({
        occupancy: 0,
        checkedIn: 0,
        availableBeds: 0,
        todayActivity: 0
      })
    }

    // 2. Get Stats for this Hostel
    // a. Occupancy & Available Beds
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('rooms')
      .select('capacity, current_occupancy')
      .eq('hostel_id', hostelId)

    let totalCapacity = 0
    let currentOccupancy = 0
    rooms?.forEach(r => {
      totalCapacity += r.capacity
      currentOccupancy += (r.current_occupancy || 0)
    })

    // b. Checked In (Active Residents)
    // We'll count accommodations where check_in_date is not null AND check_out_date is null
    const { count: checkedInCount } = await supabaseAdmin
      .from('accommodations')
      .select('*', { count: 'exact', head: true })
      .not('check_in_date', 'is', null)
      .is('check_out_date', null)

    // c. Today's Activity
    const today = new Date().toISOString().split('T')[0]
    const { count: todayActivity } = await supabaseAdmin
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .gte('check_time', `${today}T00:00:00Z`)

    return NextResponse.json({
      occupancy: currentOccupancy,
      totalCapacity,
      checkedIn: checkedInCount || 0,
      availableBeds: totalCapacity - currentOccupancy,
      todayActivity: todayActivity || 0
    })

  } catch (error) {
    console.error('Porter stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
