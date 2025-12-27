import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/settings - Fetch public system settings
export async function GET(request: NextRequest) {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('key, value')
      .in('key', ['booking_enabled', 'reservation_enabled', 'current_academic_year', 'current_semester'])

    if (error) throw error

    // Transform array to object for easier consumption
    const settingsObject = settings?.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {})

    return NextResponse.json({
      data: settingsObject
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
