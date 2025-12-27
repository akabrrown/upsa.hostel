import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data: records, error } = await supabaseAdmin
      .from('checkins')
      .select(`
        id,
        check_type,
        check_time,
        notes,
        user:users!checkins_user_id_fkey (
          id,
          index_number,
          profiles (
            first_name,
            last_name
          )
        ),
        room:rooms (
          room_number,
          hostel:hostels (name)
        )
      `)
      .gte('check_time', `${today}T00:00:00Z`)
      .order('check_time', { ascending: false })

    if (error) {
      console.error('Fetch today checkins error:', error)
      return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 })
    }

    // Transform to unified format
    const transformed = (records || []).map((r: any) => {
      const profile = r.user?.profiles && Array.isArray(r.user.profiles) ? r.user.profiles[0] : r.user?.profiles
      return {
        id: r.id,
        action: r.check_type === 'IN' ? 'checkin' : 'checkout',
        timestamp: r.check_time,
        studentName: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Student',
        indexNumber: r.user?.index_number,
        room: r.room?.room_number,
        hostel: r.room?.hostel?.name
      }
    })

    return NextResponse.json({ data: transformed })

  } catch (error) {
    console.error('Today checkins error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
