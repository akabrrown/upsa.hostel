import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const offset = (page - 1) * limit

    let query = supabase
      .from('students')
      .select(`
        *,
        room_bookings (
          rooms (
            room_number,
            floors (
              floor_number,
            ),
            hostels (
              name
            )
          )
        )
      `, { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('accommodation_status', status)
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,index_number.ilike.%${search}%`)
    }

    // Apply pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: students, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      )
    }

    // Transform to camelCase for frontend consistency
    const transformedStudents = (students || []).map((s: any) => ({
      id: s.id,
      firstName: s.first_name,
      lastName: s.last_name,
      indexNumber: s.index_number,
      email: s.email,
      phoneNumber: s.phone_number,
      phone: s.phone_number, // Alias for older components
      dateOfBirth: s.date_of_birth,
      programOfStudy: s.program || s.program_of_study,
      yearOfStudy: s.year_of_study,
      accommodationStatus: s.accommodation_status,
      paymentStatus: s.payment_status || 'pending',
      academicYear: s.academic_year,
      room: s.room_bookings?.[0]?.rooms ? {
        hostel: s.room_bookings[0].rooms.hostels?.name,
        roomNumber: s.room_bookings[0].rooms.room_number,
        floorNumber: s.room_bookings[0].rooms.floors?.floor_number,
        bedNumber: s.room_bookings[0].bed_number || ''
      } : null,
      // Keep nested structure as well just in case
      accommodation: s.room_bookings?.[0]?.rooms ? {
        hostel: { name: s.room_bookings[0].rooms.hostels?.name },
        room: { 
          roomNumber: s.room_bookings[0].rooms.room_number,
          bedNumber: s.room_bookings[0].bed_number || ''
        }
      } : null
    }))

    return NextResponse.json({
      students: transformedStudents,
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
      case 'update_status':
        // Update student accommodation status
        const { error: updateError } = await supabase
          .from('students')
          .update({ accommodation_status: data.status })
          .eq('id', studentId)

        if (updateError) {
          return NextResponse.json(
            { error: 'Failed to update student status' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Student status updated successfully',
        })

      case 'allocate_room':
        // Allocate room to student
        const { error: allocationError } = await supabase
          .from('room_bookings')
          .insert({
            student_id: studentId,
            hostel_id: data.hostelId,
            floor_id: data.floorId,
            room_id: data.roomId,
            bed_id: data.bedId,
            academic_year: data.academicYear,
            semester: data.semester,
            status: 'active',
            booked_at: new Date().toISOString(),
          })

        if (allocationError) {
          return NextResponse.json(
            { error: 'Failed to allocate room' },
            { status: 500 }
          )
        }

        // Update student status
        await supabase
          .from('students')
          .update({ accommodation_status: 'allocated' })
          .eq('id', studentId)

        // Mark bed as occupied
        await supabase
          .from('beds')
          .update({ is_occupied: true })
          .eq('id', data.bedId)

        return NextResponse.json({
          message: 'Room allocated successfully',
        })

      case 'deallocate_room':
        // Deallocate room from student
        const { error: deallocationError } = await supabase
          .from('room_bookings')
          .update({ status: 'cancelled' })
          .eq('student_id', studentId)
          .eq('status', 'active')

        if (deallocationError) {
          return NextResponse.json(
            { error: 'Failed to deallocate room' },
            { status: 500 }
          )
        }

        // Update student status
        await supabase
          .from('students')
          .update({ accommodation_status: 'pending' })
          .eq('id', studentId)

        return NextResponse.json({
          message: 'Room deallocated successfully',
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
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
