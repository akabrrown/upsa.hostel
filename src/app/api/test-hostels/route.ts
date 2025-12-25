import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('hostels')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({ 
        error: 'Database query failed', 
        details: error.message,
        code: error.code 
      })
    }

    return NextResponse.json({ 
      message: 'Connection successful',
      data: data 
    })
  } catch (err) {
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: err instanceof Error ? err.message : 'Unknown error'
    })
  }
}
