import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json({ data: null })
    }

    // Search for student by index number, first name, or last name
    const { data: student, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        index_number,
        room_bookings (
          rooms (
            room_number
          )
        )
      `)
      .or(`index_number.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(1)
      .single()

    if (error || !student) {
      return NextResponse.json({ data: null })
    }

    // Transform to camelCase
    const transformedStudent = {
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      indexNumber: student.index_number,
      room: (student.room_bookings as any)?.[0]?.rooms ? {
        roomNumber: (student.room_bookings as any)[0].rooms.room_number
      } : null
    }

    return NextResponse.json({ data: transformedStudent })

  } catch (error) {
    console.error('Search student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
