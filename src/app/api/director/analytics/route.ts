import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    const dateRange = calculateDateRange(period, startDate || undefined, endDate || undefined)

    // Get overview data
    const { data: totalStudents } = await supabase
      .from('students')
      .select('id')

    const { data: totalRooms } = await supabase
      .from('rooms')
      .select('id')

    const { data: totalBookings } = await supabase
      .from('room_bookings')
      .select('id')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)

    const { data: totalRevenue } = await supabase
      .from('payment_records')
      .select('amount')
      .gte('payment_date', dateRange.start)
      .lte('payment_date', dateRange.end)

    // Get monthly data
    const { data: monthlyData } = await supabase
      .from('room_bookings')
      .select('created_at')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)

    // Process monthly data
    const monthlyStats = processMonthlyData(monthlyData || [])

    // Get hostel performance
    const { data: hostelPerformance } = await supabase
      .from('hostels')
      .select(`
        id,
        name,
        rooms!inner(
          id,
          beds!inner(
            id,
            is_occupied
          )
        )
      `)

    // Process hostel performance
    const hostelStats = processHostelPerformance(hostelPerformance || [])

    // Get payment trends
    const { data: paymentTrends } = await supabase
      .from('payment_records')
      .select('amount, payment_date')
      .gte('payment_date', dateRange.start)
      .lte('payment_date', dateRange.end)
      .order('payment_date', { ascending: true })

    // Process payment trends
    const paymentStats = processPaymentTrends(paymentTrends || [])

    const analytics = {
      overview: {
        totalStudents: totalStudents?.length || 0,
        totalRooms: totalRooms?.length || 0,
        totalBookings: totalBookings?.length || 0,
        totalRevenue: calculateTotalRevenue(totalRevenue || []),
        occupancyRate: calculateOccupancyRate(totalRooms || [], totalBookings || []),
        growthRate: calculateGrowthRate(dateRange.start, dateRange.end),
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

function processMonthlyData(bookings: any[]) {
  const monthlyMap = new Map()
  
  bookings.forEach(booking => {
    const month = new Date(booking.created_at).toLocaleString('default', { month: 'short' })
    const current = monthlyMap.get(month) || { count: 0, occupancy: 0 }
    monthlyMap.set(month, {
      count: current.count + 1,
      occupancy: current.occupancy + 1
    })
  })

  return Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    students: data.count,
    occupancy: Math.round((data.occupancy / 320) * 100), // Assuming 320 total rooms
    revenue: data.count * 1500 // Average revenue per booking
  }))
}

function processHostelPerformance(hostels: any[]) {
  return hostels.map(hostel => {
    const totalBeds = hostel.rooms?.reduce((sum: number, room: any) => 
      sum + (room.beds?.length || 0), 0) || 0

    const occupiedBeds = hostel.rooms?.reduce((sum: number, room: any) => 
      sum + (room.beds?.filter((bed: any) => bed.is_occupied).length || 0), 0) || 0
    
    const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0
    const revenue = occupiedBeds * 1500 // Average revenue per occupied bed
    
    return {
      name: hostel.name,
      occupancy: Math.round(occupancyRate),
      revenue,
      maintenance: Math.floor(Math.random() * 5) // Mock maintenance count
    }
  })
}

function processPaymentTrends(payments: any[]) {
  const monthlyMap = new Map()
  
  payments.forEach(payment => {
    const month = new Date(payment.payment_date).toLocaleString('default', { month: 'short' })
    const current = monthlyMap.get(month) || { amount: 0, count: 0 }
    monthlyMap.set(month, {
      amount: current.amount + payment.amount,
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

function calculateOccupancyRate(rooms: any[], bookings: any[]) {
  const totalBeds = rooms.reduce((sum: number, room: any) => 
    sum + (room.capacity || 4), 0) // Assuming 4 beds per room
  const occupiedBeds = bookings.length
  return totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0
}

function calculateGrowthRate(startDate: string, endDate: string) {
  // Mock growth rate calculation
  return Math.round((Math.random() * 20) + 5) // 5-25% growth rate
}
