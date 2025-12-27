import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 1. Total Students
    // First get student role ID
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', 'student')
      .single()

    if (roleError) throw roleError

    const { count: totalStudents, error: studentError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', roleData.id)

    if (studentError) throw studentError

    // 2. Occupancy Rate
    // Get stats from rooms table
    const { data: roomStats, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('capacity, current_occupancy')

    if (roomError) throw roomError

    let totalCapacity = 0
    let totalOccupied = 0

    if (roomStats) {
      roomStats.forEach(room => {
        totalCapacity += room.capacity
        totalOccupied += room.current_occupancy || 0
      })
    }

    const occupancyRate = totalCapacity > 0 
      ? Math.round((totalOccupied / totalCapacity) * 100) 
      : 0

    // 3. Pending Payments
    const { count: pendingPayments, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending')

    if (paymentError) throw paymentError

    // 4. Pending Applications
    const { count: pendingBookings, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending')

    if (bookingError) throw bookingError

    const { count: pendingReservations, error: reservationError } = await supabaseAdmin
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending')

    if (reservationError) throw reservationError

    const pendingApplications = (pendingBookings || 0) + (pendingReservations || 0)

    // 5. Recent Activity (Latest 5 items from bookings or payments)
    // Fetch recent students using profiles to get names
    const { data: recentStudents, error: recentError } = await supabaseAdmin
      .from('users')
      .select(`
        id, 
        created_at,
        profiles(first_name, last_name)
      `)
      .eq('role_id', roleData.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) throw recentError

    const recentActivities = recentStudents?.map(s => {
       const profile = s.profiles && Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
       // Fallback for names if missing (handled by my previous fix on storage, but safe display here)
       const name = profile ? `${profile.first_name || 'Student'} ${profile.last_name || ''}` : 'New Student'
       
       return {
          id: s.id,
          type: 'student_added' as const,
          description: `New student ${name} registered`,
          timestamp: s.created_at,
       }
    }) || []

    return NextResponse.json({
      totalStudents: totalStudents || 0,
      occupancyRate,
      pendingPayments: pendingPayments || 0,
      pendingApplications,
      recentActivities,
    })

  } catch (error) {
    console.error('Admin stats fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
