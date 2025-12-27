import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const peerId = searchParams.get('peerId')

    // Get current user from cookie or header
    const token = request.cookies.get('sb-access-token')?.value || 
                  request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!peerId) {
      return NextResponse.json({ error: 'Missing peerId parameter' }, { status: 400 })
    }

    // Fetch messages where sender is me AND recipient is peer OR sender is peer AND recipient is me
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${peerId}),and(sender_id.eq.${peerId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching chat history:', error)
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    return NextResponse.json({ messages: data })
  } catch (error) {
    console.error('Error in chat history route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
