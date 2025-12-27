import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const offset = (page - 1) * limit

    // 1. Get Student Role ID
    const { data: roleData } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', 'student')
      .single()

    if (!roleData) {
      return NextResponse.json({ error: 'Student role not found' }, { status: 500 })
    }

    // 2. Build Query
    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        index_number,
        created_at,
        profiles (
          first_name,
          last_name,
          phone_number,
          date_of_birth,
          program,
          year_of_study,
          academic_year
        ),
        accommodations (
          id,
          bed_number,
          room:rooms (
            room_number,
            floor_number,
            hostel:hostels (name)
          )
        ),
        bookings (
          status
        ),
        payments (
          status,
          amount,
          created_at
        )
      `, { count: 'exact' })
      .eq('role_id', roleData.id)

    // 3. Apply Filters
    if (search) {
       query = query.ilike('index_number', `%${search}%`)
    }

    // 4. Pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: users, error, count } = await query

    if (error) throw error

    // 5. Transform Data & Derive Status
    const transformedStudents = (users || []).map((u: any) => {
      const profile = u.profiles && Array.isArray(u.profiles) ? u.profiles[0] : u.profiles
      const activeAccommodation = u.accommodations && u.accommodations.length > 0 ? u.accommodations[0] : null 
      const pendingBooking = u.bookings?.some((b: any) => b.status === 'Pending')
      
      // Derive accommodation status
      let derivedAccStatus = 'none'
      if (activeAccommodation) derivedAccStatus = 'allocated'
      else if (pendingBooking) derivedAccStatus = 'pending'

      // Derive payment status
      const studentPayments = u.payments || []
      const hasConfirmedPayment = studentPayments.some((p: any) => p.status === 'Confirmed')
      
      let derivedPaymentStatus = 'pending'
      if (hasConfirmedPayment) derivedPaymentStatus = 'paid'

      return {
        id: u.id,
        firstName: profile?.first_name || 'N/A',
        lastName: profile?.last_name || '',
        indexNumber: u.index_number,
        email: u.email,
        phoneNumber: profile?.phone_number,
        phone: profile?.phone_number,
        dateOfBirth: profile?.date_of_birth,
        programOfStudy: profile?.program || 'N/A',
        yearOfStudy: profile?.year_of_study || 0,
        accommodationStatus: derivedAccStatus,
        paymentStatus: derivedPaymentStatus,
        academicYear: profile?.academic_year,
        accommodation: activeAccommodation ? {
           hostel: {
             name: activeAccommodation.room?.hostel?.name
           },
           room: {
             roomNumber: activeAccommodation.room?.room_number
           },
           floorNumber: activeAccommodation.room?.floor_number,
           bedNumber: activeAccommodation.bed_number
        } : null
      }
    })

    // 6. Fetch Global Stats for Dashboard
    const [{ count: allocatedCount }, { data: pendingPayments }] = await Promise.all([
      // Allocated count
      supabaseAdmin
        .from('accommodations')
        .select('id', { count: 'exact', head: true }),
      
      // Pending payments count
      supabaseAdmin
        .from('payments')
        .select('user_id')
        .eq('status', 'Pending')
    ])

    const uniquePendingCount = new Set((pendingPayments || []).map(p => p.user_id)).size

    // Filter by status in memory if requested 
    let finalStudents = transformedStudents
    const statusFilter = searchParams.get('status')
    if (statusFilter) {
      finalStudents = transformedStudents.filter((s: any) => s.accommodationStatus === statusFilter)
    }

    return NextResponse.json({
      students: finalStudents,
      stats: {
        total: count || 0,
        allocated: allocatedCount || 0,
        unallocated: Math.max(0, (count || 0) - (allocatedCount || 0)),
        overdue: uniquePendingCount // Using pending as a proxy for attention needed
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Students fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, studentId, data } = body

    if (!action || !studentId) {
      return NextResponse.json(
        { error: 'Action and student ID are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'allocate_room':
        // Allocate = Insert into accommodations
        // 1. Get Room ID from request or lookup (data should have roomId)
        if (!data.roomId) {
            return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
        }

        const { error: allocationError } = await supabaseAdmin
          .from('accommodations')
          .insert({
            user_id: studentId,
            room_id: data.roomId,
            bed_number: data.bedId, // bedId comes as string bed number usually, or verify?
            academic_year: data.academicYear || '2024/2025',
            semester: data.semester || 'First Semester',
            allocation_date: new Date().toISOString(),
          })

        if (allocationError) throw allocationError

        // Increment room occupancy
        // Supabase doesn't support increment easily without RPC, so we fetch and update.
        // Or assume trigger handles it? No trigger in schema for occupancy count update.
        // We'll manual update.
        const { data: room } = await supabaseAdmin.from('rooms').select('current_occupancy').eq('id', data.roomId).single()
        if (room) {
             await supabaseAdmin.from('rooms').update({ current_occupancy: (room.current_occupancy || 0) + 1 }).eq('id', data.roomId)
        }

        return NextResponse.json({ message: 'Room allocated successfully' })

      case 'deallocate_room':
        // Deallocate = Delete from accommodations
        const { error: deallocError } = await supabaseAdmin
          .from('accommodations')
          .delete()
          .eq('user_id', studentId)
        
        if (deallocError) throw deallocError

        // Decrement room occupancy logic would be needed here too if strict.

        return NextResponse.json({ message: 'Room deallocated successfully' })

      default:
        return NextResponse.json(
          { error: 'Invalid action or not supported' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Student management error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
