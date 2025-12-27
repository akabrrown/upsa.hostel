import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('sb-access-token')?.value || 
                  request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formattedHistory: any[] = []

    // 1. Fetch Reservations
    try {
      const { data: reservations, error: resError } = await supabaseAdmin
        .from('reservations')
        .select(`
          *,
          preferred_hostel:hostels!preferred_hostel_id (name),
          preferred_room_type:room_types!preferred_room_type_id (name)
        `)
        .eq('user_id', user.id)
        .order('reservation_date', { ascending: false })

      if (!resError && reservations) {
        reservations.forEach((res: any) => {
          formattedHistory.push({
            id: res.id,
            type: 'reservation',
            status: res.status?.toLowerCase() || 'pending',
            createdAt: res.reservation_date || res.created_at,
            academicYear: res.academic_year || 'N/A',
            semester: res.semester || 'N/A',
            details: {
              hostel: res.preferred_hostel?.name || 'General Request',
              roomType: res.preferred_room_type?.name || 'Standard',
              price: 0
            }
          })
        })
      } else if (resError) {
        console.error('Reservations fetch error:', resError)
      }
    } catch (err) {
      console.error('Reservations exception:', err)
    }

    // 2. Fetch Bookings
    try {
      const { data: bookings, error: bookError } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!bookError && bookings) {
        bookings.forEach((booking: any) => {
          formattedHistory.push({
            id: booking.id,
            type: 'booking',
            status: booking.status?.toLowerCase() || 'pending',
            createdAt: booking.created_at,
            academicYear: booking.academic_year || 'N/A',
            semester: booking.semester || 'N/A',
            details: {
              hostel: 'Pending Allocation',
              price: 0
            }
          })
        })
      } else if (bookError) {
        console.error('Bookings fetch error:', bookError)
      }
    } catch (err) {
      console.error('Bookings exception:', err)
    }

    // 3. Fetch Accommodations with simpler joins
    try {
      const { data: accommodations, error: accError } = await supabaseAdmin
        .from('accommodations')
        .select(`
          *,
          room:rooms (
            id,
            room_number,
            room_type,
            floor_id,
            hostel:hostels (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('allocation_date', { ascending: false })

      if (!accError && accommodations) {
        accommodations.forEach((acc: any) => {
          const room = acc.room
          
          formattedHistory.push({
            id: acc.id,
            type: 'booking',
            status: acc.is_active ? 'active' : 'completed',
            createdAt: acc.allocation_date,
            academicYear: acc.academic_year || 'N/A',
            semester: acc.semester || 'N/A',
            details: {
              hostel: room?.hostel?.name || 'Unknown Hostel',
              floor: room?.floor_id,
              room: room?.room_number,
              roomType: room?.room_type || 'Standard',
              price: 0
            },
            allocation: {
              hostel: room?.hostel?.name,
              roomNumber: room?.room_number,
              bedNumber: acc.bed_number,
              allocatedAt: acc.allocation_date
            }
          })
        })
      } else if (accError) {
        console.error('Accommodations fetch error:', accError)
      }
    } catch (err) {
      console.error('Accommodations exception:', err)
    }

    // Sort combined history by date
    formattedHistory.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json(formattedHistory)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations history' }, 
      { status: 500 }
    )
  }
}
