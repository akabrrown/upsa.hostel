import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session } = body

    if (!session) {
      return NextResponse.json(
        { error: 'No session provided' },
        { status: 400 }
      )
    }

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to sign out' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Logout successful',
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
