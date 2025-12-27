import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    // Get current user from cookie or header
    const token = request.cookies.get('sb-access-token')?.value || 
                  request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Get current user's active accommodation with room and hostel details
    const { data: myAccommodation, error: accError } = await supabaseAdmin
      .from('accommodations')
      .select(`
        room_id,
        room:rooms (
          room_number,
          hostel:hostels (
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (accError) throw accError

    if (!myAccommodation) {
      return NextResponse.json({ 
        roommates: [],
        roomInfo: null,
        message: 'No active accommodation found for this user.'
      })
    }

    const roomInfo = {
      roomNumber: (myAccommodation.room as any).room_number,
      hostelName: (myAccommodation.room as any).hostel.name
    }

    // 2. Fetch all students in the same room (including current user)
    const { data: rawRoommates, error: roomError } = await supabaseAdmin
      .from('accommodations')
      .select(`
        id,
        bed_number,
        allocation_date,
        user:users (
          id,
          email,
          index_number,
          profile:profiles (
            first_name,
            last_name,
            student_id,
            program,
            year_of_study,
            phone_number,
            gender,
            date_of_birth
          )
        )
      `)
      .eq('room_id', myAccommodation.room_id)
      .eq('is_active', true)

    if (roomError) throw roomError

    // 3. Fetch unread messages count for current user
    const { data: unreadMessages } = await supabaseAdmin
      .from('messages')
      .select('sender_id')
      .eq('recipient_id', user.id)
      .eq('is_read', false)

    // Create a map of sender_id -> count
    const unreadMap = new Map<string, number>()
    if (unreadMessages) {
      unreadMessages.forEach((msg: any) => {
        const count = unreadMap.get(msg.sender_id) || 0
        unreadMap.set(msg.sender_id, count + 1)
      })
    }

    // 4. Process and format roommate data
    const roommates = rawRoommates?.map((r: any) => {
      const profile = r.user.profile
      return {
        id: r.user.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous Student',
        indexNumber: r.user.index_number || profile.student_id || '',
        program: profile.program || 'Not stated',
        yearOfStudy: profile.year_of_study ? `Year ${profile.year_of_study}` : 'Not stated',
        email: r.user.email,
        phone: profile.phone_number || 'Not provided',
        bedNumber: r.bed_number,
        checkInDate: r.allocation_date,
        isAvailable: true,
        isMe: r.user.id === user.id,
        unreadCount: unreadMap.get(r.user.id) || 0
      }
    })
    
    // Sort so 'Me' is first
    roommates?.sort((a: any, b: any) => (a.isMe === b.isMe) ? 0 : a.isMe ? -1 : 1)

    return NextResponse.json({
      roommates: roommates || [],
      roomInfo
    })

  } catch (error) {
    console.error('Error fetching roommates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roommates' },
      { status: 500 }
    )
  }
}
