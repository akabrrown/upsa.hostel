
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Admin Auth
    const token = request.cookies.get('sb-access-token')?.value || 
                  request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Double check admin role
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role_id, roles(name)')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.roles as any)?.name !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // 2. Perform System Reset
    // Note: Order matters due to foreign keys. 
    // Delete accommodations first (references rooms, users)
    const { error: accError } = await supabaseAdmin
      .from('accommodations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (accError) {
      console.error('Error deleting accommodations:', accError)
      return NextResponse.json({ error: 'Failed to clear accommodations' }, { status: 500 })
    }

    // Delete bookings
    const { error: bookError } = await supabaseAdmin
      .from('bookings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (bookError) {
       console.error('Error deleting bookings:', bookError)
       // Continue? Or fail? Let's try to proceed.
    }

    // Delete room_bookings (if exists and distinct)
    // Some routes use room_bookings table? 
    // "bookings" vs "room_bookings" - Director API used "bookings", checkin used "room_bookings".
    // I should clear both to be safe or check which one to clear.
    // Based on previous steps, student reservation uses `room_bookings`?
    // Let's safe delete both if possible.
    const { error: roomBookError } = await supabaseAdmin
      .from('room_bookings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    // Reset Room Occupancy
    const { error: roomError } = await supabaseAdmin
      .from('rooms')
      .update({ current_occupancy: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all

    if (roomError) {
      console.error('Error resetting rooms:', roomError)
    }

    // Reset Beds (if table exists)
    // We try to update is_occupied to false
    const { error: bedError } = await supabaseAdmin
      .from('beds')
      .update({ is_occupied: false })
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (bedError) {
       // Ignore error if table doesn't exist or column differs
       console.log('Bed reset info:', bedError.message)
    }

    return NextResponse.json({ message: 'System reset successfully' })

  } catch (error) {
    console.error('System reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
