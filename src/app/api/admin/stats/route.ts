import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 1. Total Students
    const { count: totalStudents, error: studentError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    if (studentError) throw studentError

    // 2. Occupancy Rate
    const { count: totalBeds, error: bedsError } = await supabase
      .from('beds')
      .select('*', { count: 'exact', head: true })

    if (bedsError) throw bedsError

    const { count: occupiedBeds, error: occupiedError } = await supabase
      .from('beds')
      .select('*', { count: 'exact', head: true })
      .eq('is_occupied', true)

    if (occupiedError) throw occupiedError

    const occupancyRate = totalBeds && totalBeds > 0 
      ? Math.round((Number(occupiedBeds) / Number(totalBeds)) * 100) 
      : 0

    // 3. Pending Payments
    const { count: pendingPayments, error: paymentError } = await supabase
      .from('payment_records')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (paymentError) throw paymentError

    // 4. Pending Applications
    const { count: pendingBookings, error: bookingError } = await supabase
      .from('room_bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (bookingError) throw bookingError

    const { count: pendingReservations, error: reservationError } = await supabase
      .from('room_reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (reservationError) throw reservationError

    const pendingApplications = (Number(pendingBookings) || 0) + (Number(pendingReservations) || 0)

    // 5. Recent Activity (Latest 5 items from bookings or payments)
    // For now, let's just get the latest students added
    const { data: recentStudents, error: recentError } = await supabase
      .from('students')
      .select('id, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) throw recentError

    const recentActivities = recentStudents?.map(s => ({
      id: s.id,
      type: 'student_added' as const,
      description: `New student ${s.first_name} ${s.last_name} registered`,
      timestamp: s.created_at,
    })) || []

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
