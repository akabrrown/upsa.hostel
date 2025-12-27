import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json({ data: null })
    }

    // Search for student by index number, first name, or last name
    // We join users and profiles
    const { data: students, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        index_number,
        profiles!inner (
          first_name,
          last_name
        ),
        accommodations (
          room:rooms (
            room_number,
            hostel:hostels (name)
          )
        )
      `)
      .or(`index_number.ilike.%${query}%,profiles.first_name.ilike.%${query}%,profiles.last_name.ilike.%${query}%`)
      .limit(1)

    if (error || !students || students.length === 0) {
      return NextResponse.json({ data: null })
    }

    const student = students[0]
    const profile = student.profiles && Array.isArray(student.profiles) ? student.profiles[0] : student.profiles
    const accommodation = student.accommodations && student.accommodations.length > 0 ? student.accommodations[0] : null
    const room = accommodation?.room && Array.isArray(accommodation.room) ? accommodation.room[0] : (accommodation?.room as any)

    // Transform to camelCase
    const transformedStudent = {
      id: student.id,
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      indexNumber: student.index_number,
      email: student.email,
      room: room ? {
        roomNumber: room.room_number,
        hostel: room.hostel && Array.isArray(room.hostel) ? room.hostel[0]?.name : (room.hostel as any)?.name
      } : null
    }

    return NextResponse.json({ data: transformedStudent })

  } catch (error) {
    console.error('Search student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
