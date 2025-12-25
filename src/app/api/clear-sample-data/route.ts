import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST() {
  try {
    const results: any = {}

    // Remove sample hostels
    const { data: hostels, error: hostelError } = await supabaseAdmin
      .from('hostels')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
      .select()

    results.hostels = {
      deleted: hostels?.length || 0,
      error: hostelError?.message || null
    }

    // Remove sample rooms
    const { data: rooms, error: roomError } = await supabaseAdmin
      .from('rooms')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
      .select()

    results.rooms = {
      deleted: rooms?.length || 0,
      error: roomError?.message || null
    }

    // Remove sample bookings
    const { data: bookings, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
      .select()

    results.bookings = {
      deleted: bookings?.length || 0,
      error: bookingError?.message || null
    }

    // Remove sample accommodations
    const { data: accommodations, error: accommodationError } = await supabaseAdmin
      .from('accommodations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
      .select()

    results.accommodations = {
      deleted: accommodations?.length || 0,
      error: accommodationError?.message || null
    }

    // Remove sample payments
    const { data: payments, error: paymentError } = await supabaseAdmin
      .from('payments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
      .select()

    results.payments = {
      deleted: payments?.length || 0,
      error: paymentError?.message || null
    }

    // Remove sample announcements
    const { data: announcements, error: announcementError } = await supabaseAdmin
      .from('announcements')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
      .select()

    results.announcements = {
      deleted: announcements?.length || 0,
      error: announcementError?.message || null
    }

    // Remove sample notifications
    const { data: notifications, error: notificationError } = await supabaseAdmin
      .from('notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
      .select()

    results.notifications = {
      deleted: notifications?.length || 0,
      error: notificationError?.message || null
    }

    return NextResponse.json({
      message: 'Sample data cleared successfully',
      results
    })
  } catch (err) {
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
