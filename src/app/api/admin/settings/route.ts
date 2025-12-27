import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/admin/settings - Fetch all system settings
export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')

    if (error) {
      // If table doesn't exist, we might get an error
      if (error.code === '42P01') {
        return NextResponse.json({ 
          error: 'System settings table not initialized.',
          settings: [] 
        }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST /api/admin/settings - Update system settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, description } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and Value are required' }, { status: 400 })
    }

    const { data: setting, error } = await supabaseAdmin
      .from('system_settings')
      .upsert({
        key,
        value,
        description,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: 'Setting updated successfully', setting })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
