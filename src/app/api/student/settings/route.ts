import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client for bypass RLS if needed, but we'll try to use user auth when possible
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getUserId(request: NextRequest) {
  // Simple check for auth session - in a real app this would use a more robust helper
  // For this implementation, we'll rely on the user passing their ID in some way or 
  // extract it from the session if available.
  // Since we are in Next.js App Router, we should ideally use supabase server client.
  return null // Placeholder, will refine below
}

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Identify user via Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch settings
    const { data: initialSettings, error } = await supabaseAdmin
      .from('student_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let settings = initialSettings

    // If no settings exist, create defaults
    if (error && error.code === 'PGRST116') {
      const { data: newSettings, error: createError } = await supabaseAdmin
        .from('student_settings')
        .insert({
          user_id: user.id,
          email_notifications: true,
          sms_notifications: true,
          push_notifications: false,
          theme: 'light'
        })
        .select()
        .single()

      if (createError) throw createError
      settings = newSettings
    } else if (error) {
      throw error
    }

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('Error in settings API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email_notifications, sms_notifications, push_notifications, theme } = body

    const { data: settings, error } = await supabaseAdmin
      .from('student_settings')
      .update({
        email_notifications,
        sms_notifications,
        push_notifications,
        theme,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
