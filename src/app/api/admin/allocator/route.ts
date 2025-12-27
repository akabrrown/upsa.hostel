import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
// Force re-compile of this route

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('sb-access-token')?.value || 
                  request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    console.log('Auth check:', { userId: user?.id, authError })

    if (authError || !user) {
      console.log('Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's role_id
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role_id')
      .eq('id', user.id)
      .single()

    console.log('User data check:', { userData, userError, userId: user.id })

    if (userError || !userData) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ error: 'Error verifying user', details: userError }, { status: 500 })
    }

    // Get role name from roles table
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('name')
      .eq('id', userData.role_id)
      .single()

    console.log('Role check:', { roleData, roleError })

    const userRole = roleData?.name || 'student'

    if (userRole !== 'admin') {
      console.log('Access denied - user role:', userRole)
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    console.log('Admin access granted for user:', user.id)

    // Fetch all reservations with preferences joined
    const { data: reservations, error: reservationsError } = await supabaseAdmin
      .from('reservations')
      .select(`
        *,
        preferred_hostel:hostels!preferred_hostel_id (name)
      `)
      .order('created_at', { ascending: false })

    console.log('Reservations query result:', { reservations, reservationsError })

    if (reservationsError) {
      console.error('Error fetching reservations:', reservationsError)
      return NextResponse.json({ error: 'Failed to fetch reservations', details: reservationsError }, { status: 500 })
    }

    if (!reservations || reservations.length === 0) {
      console.log('No reservations found in database')
      return NextResponse.json([])
    }

    // Fetch user details for each reservation with profile join
    const userIds = Array.from(new Set(reservations.map((r: any) => r.user_id)))
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        id, 
        index_number, 
        email,
        profiles (
          first_name,
          last_name,
          phone_number,
          program,
          year_of_study
        )
      `)
      .in('id', userIds)

    console.log('Users query result:', { usersCount: users?.length, usersError })

    // Create a map of users by ID for quick lookup
    const usersMap = new Map()
    if (users) {
      users.forEach((user: any) => {
        usersMap.set(user.id, user)
      })
    }

    // Transform the data to match the frontend interface
    const formattedReservations = reservations.map((res: any) => {
      const user = usersMap.get(res.user_id)
      const profile = user?.profiles && Array.isArray(user.profiles) ? user.profiles[0] : user?.profiles
      
      return {
        id: res.id,
        studentId: res.user_id,
        studentName: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown',
        indexNumber: user?.index_number || 'N/A',
        email: user?.email || 'N/A',
        phone: profile?.phone_number || 'N/A',
        program: profile?.program || 'N/A',
        yearOfStudy: profile?.year_of_study || 'N/A',
        
        // Preferences
        preferredHostel: res.preferred_hostel?.name || 'Any Hostel',
        preferredHostelId: res.preferred_hostel_id || '',
        preferredFloor: res.preferred_floor_id || 0,
        preferredFloorId: res.preferred_floor_id || '',
        preferredRoomType: res.preferred_room_type?.name || 'Any Type',
        preferredRoomTypeId: res.preferred_room_type_id || '',
        
        // Status and dates
        status: res.status === 'Approved' ? 'allocated' : (res.status?.toLowerCase() || 'pending'),
        submissionDate: res.reservation_date || res.created_at,
        academicYear: res.academic_year || 'N/A',
        semester: res.semester || 'N/A',
        
        // Additional info
        specialRequests: res.special_requests || '',
        notes: res.admin_notes || res.notes || ''
      }
    })

    return NextResponse.json(formattedReservations)
  } catch (error) {
    console.error('Error in admin reservations API:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('--- RECV POST /api/admin/allocator ---')
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    const { 
      reservationId, 
      studentId, 
      hostelId, 
      floorNumber, 
      roomNumber, 
      bedNumber, 
      notes 
    } = body

    if (!reservationId || !studentId || !hostelId || !roomNumber) {
      console.log('Validation failed:', { reservationId, studentId, hostelId, roomNumber })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Find the room_id
    const { data: room, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('id, current_occupancy, capacity')
      .eq('hostel_id', hostelId)
      .eq('room_number', roomNumber)
      .maybeSingle()

    if (roomError) {
      console.log('Database error searching for room:', roomError)
      return NextResponse.json({ error: 'Database error searching for room' }, { status: 500 })
    }

    if (!room) {
      console.log('Room not found with:', { hostelId, roomNumber })
      // List some rooms in this hostel for debugging
      const { data: rooms } = await supabaseAdmin
        .from('rooms')
        .select('room_number')
        .eq('hostel_id', hostelId)
        .limit(5)
      console.log('Available rooms sample:', rooms)
      
      return NextResponse.json({ 
        error: `Room "${roomNumber}" not found in this hostel.`,
        details: { hostelId, providedRoomNumber: roomNumber }
      }, { status: 404 })
    }

    if (room.current_occupancy >= room.capacity) {
      console.log('Room capacity reached:', room)
      return NextResponse.json({ error: 'Room is already at full capacity' }, { status: 400 })
    }

    // 2. Fetch reservation details for academic info
    const { data: reservation, error: resError } = await supabaseAdmin
      .from('reservations')
      .select('semester, academic_year')
      .eq('id', reservationId)
      .single()

    if (resError || !reservation) {
      console.log('Reservation not found error:', resError)
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // 3. Update reservation status
    const { error: updateResError } = await supabaseAdmin
      .from('reservations')
      .update({ 
        status: 'Approved', 
        room_id: room.id,
        admin_notes: notes 
      })
      .eq('id', reservationId)

    if (updateResError) throw updateResError

    // 4. Create accommodation record
    const { error: accError } = await supabaseAdmin
      .from('accommodations')
      .insert({
        user_id: studentId,
        room_id: room.id,
        bed_number: bedNumber,
        allocation_date: new Date().toISOString().split('T')[0],
        semester: reservation.semester,
        academic_year: reservation.academic_year,
        is_active: true
      })

    if (accError) throw accError

    // 5. Update room occupancy
    const { error: updateRoomError } = await supabaseAdmin
      .from('rooms')
      .update({ current_occupancy: room.current_occupancy + 1 })
      .eq('id', room.id)

    if (updateRoomError) throw updateRoomError

    console.log('Allocation successful for:', studentId)
    return NextResponse.json({ message: 'Room allocated successfully' })
  } catch (error: any) {
    console.error('Error in allocation API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
