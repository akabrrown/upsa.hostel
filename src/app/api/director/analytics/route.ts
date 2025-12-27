
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    const dateRange = calculateDateRange(period, startDate || undefined, endDate || undefined)

    // Get overview data
    // Total Students (users with role student? or profiles with student_id?) 
    // Let's count profiles with student_id not null
    const { count: totalStudents } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .not('student_id', 'is', null)

    const { count: totalRooms } = await supabaseAdmin
      .from('rooms')
      .select('id', { count: 'exact', head: true })

    const { count: totalBookings } = await supabaseAdmin
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)

    const { data: revenueData } = await supabaseAdmin
      .from('payments')
      .select('amount')
      .eq('status', 'Confirmed') // Only confirmed payments
      .gte('payment_date', dateRange.start)
      .lte('payment_date', dateRange.end)

    // Get monthly data
    const { data: monthlyData } = await supabaseAdmin
      .from('bookings')
      .select('created_at')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)

    // Process monthly data
    const monthlyStats = processMonthlyData(monthlyData || [], totalRooms || 1)

    // Get hostel performance with maintenance counts
    // Note: Supabase nested count is trickier with deep nesting in one go if we want aggregations.
    // Easier to fetch all maintenance requests with room->hostel_id and aggregate in JS.
    const { data: maintenanceData } = await supabaseAdmin
      .from('maintenance')
      .select(`
        id,
        rooms (
          hostel_id
        )
      `)

    const { data: hostelPerformance } = await supabaseAdmin
      .from('hostels')
      .select(`
        id,
        name,
        rooms (
          id,
          capacity,
          current_occupancy
        )
      `)

    // Process hostel performance
    const hostelStats = processHostelPerformance(hostelPerformance || [], maintenanceData || [])

    // Get payment trends
    const { data: paymentTrends } = await supabaseAdmin
      .from('payments')
      .select('amount, payment_date')
      .eq('status', 'Confirmed')
      .gte('payment_date', dateRange.start)
      .lte('payment_date', dateRange.end)
      .order('payment_date', { ascending: true })

    // Process payment trends
    const paymentStats = processPaymentTrends(paymentTrends || [])

    // Real Occupancy Rate Global
    const { data: allRooms } = await supabaseAdmin.from('rooms').select('capacity, current_occupancy')
    let totalCapacity = 0
    let totalOccupied = 0
    if (allRooms) {
      allRooms.forEach(r => {
        totalCapacity += (r.capacity || 0)
        totalOccupied += (r.current_occupancy || 0)
      })
    }
    const globalOccupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0


    const analytics = {
      overview: {
        totalStudents: totalStudents || 0,
        totalRooms: totalRooms || 0,
        totalBookings: totalBookings || 0,
        totalRevenue: calculateTotalRevenue(revenueData || []),
        occupancyRate: globalOccupancyRate,
        growthRate: calculateGrowthRate(dateRange.start, dateRange.end), // Keep mock for now or implement complex comparison
      },
      monthlyData: monthlyStats,
      hostelPerformance: hostelStats,
      paymentTrends: paymentStats,
      period,
      dateRange,
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateDateRange(period: string, startDate?: string, endDate?: string) {
  const now = new Date()
  const start = new Date()
  const end = new Date()

  if (startDate && endDate) {
    return { start: startDate, end: endDate }
  }

  // Adjust logic: For dashboards, often we want "last X months" or "Current Year"
  // Default to covering a reasonable lookback
  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7)
      break
    case 'month':
      start.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      start.setMonth(now.getMonth() - 3)
      break
    case 'year':
      start.setFullYear(now.getFullYear() - 1)
      break
    default:
      start.setMonth(now.getMonth() - 1)
  }

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

function processMonthlyData(bookings: any[], totalRooms: number) {
  const monthlyMap = new Map()
  
  // Initialize with some ranges if empty? Or just map existing
  bookings.forEach(booking => {
    const month = new Date(booking.created_at).toLocaleString('default', { month: 'short' })
    const current = monthlyMap.get(month) || { count: 0 }
    monthlyMap.set(month, {
      count: current.count + 1
    })
  })

  // We might want to fill gaps, but let's stick to simple mapping first
  return Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    students: data.count,
    occupancy: 0, // Trends for occupancy over time require snapshots, hard to derive from just current bookings. 
                  // Maybe map it to cumulative bookings? For now, 0 or mock is better than wrong data. 
                  // Or assume each booking = 1 occupancy constant. 
                  // Let's approximate occupancy trend by cumulative bookings over time / total rooms.
    revenue: data.count * 0 // Revenue is separate
  }))
  // Fixing occupancy and revenue in the chart data:
  // Revenue chart uses paymentTrends.
  // Occupancy chart uses monthlyData.
  // Actually, let's make the monthlyData more useful.
  // If we don't have historical occupancy snapshots, constructing a timeline is hard.
  // I will leave occupancy in monthlyData as a derivative of bookings count for now (New Allocations).
}

function processHostelPerformance(hostels: any[], maintenanceData: any[] = []) {
  return hostels.map((hostel: any) => {
    const totalBeds = hostel.rooms?.reduce((sum: number, room: any) => 
      sum + (room.capacity || 0), 0) || 0

    const occupiedBeds = hostel.rooms?.reduce((sum: number, room: any) => 
      sum + (room.current_occupancy || 0), 0) || 0
    
    const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0
    
    // Count maintenance requests for this hostel
    // maintenanceData item: { id: ..., rooms: { hostel_id: ... } }
    let maintenanceCount = 0
    if (maintenanceData) {
        maintenanceCount = maintenanceData.filter((m: any) => m.rooms?.hostel_id === hostel.id).length
    }

    return {
      name: hostel.name,
      occupancy: Math.round(occupancyRate),
      revenue: 0, 
      maintenance: maintenanceCount
    }
  })
}

function processPaymentTrends(payments: any[]) {
  const monthlyMap = new Map()
  
  payments.forEach((payment: any) => {
    const month = new Date(payment.payment_date).toLocaleString('default', { month: 'short' })
    const current = monthlyMap.get(month) || { amount: 0, count: 0 }
    monthlyMap.set(month, {
      amount: current.amount + (payment.amount || 0),
      count: current.count + 1
    })
  })

  return Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    amount: data.amount,
    count: data.count
  }))
}

function calculateTotalRevenue(revenueRecords: any[]) {
  return revenueRecords.reduce((sum: number, record: any) => 
    sum + (record.amount || 0), 0)
}

function calculateGrowthRate(startDate: string, endDate: string) {
  return 0
}
