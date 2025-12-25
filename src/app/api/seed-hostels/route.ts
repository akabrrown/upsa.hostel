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
    const sampleHostels = [
      {
        name: 'UPSA Main Hostel - Block A',
        code: 'HBLK-A',
        address: 'UPSA Campus, Accra, Ghana',
        description: 'Modern hostel facility with excellent amenities and security',
        created_at: new Date().toISOString()
      },
      {
        name: 'UPSA Female Hostel - Block B',
        code: 'HBLK-B',
        address: 'UPSA Campus, Accra, Ghana',
        description: 'Female-only hostel with enhanced security and privacy features',
        created_at: new Date().toISOString()
      },
      {
        name: 'UPSA Male Hostel - Block C',
        code: 'HBLK-C',
        address: 'UPSA Campus, Accra, Ghana',
        description: 'Male-only hostel with sports facilities and recreation areas',
        created_at: new Date().toISOString()
      }
    ]

    const { data, error } = await supabaseAdmin
      .from('hostels')
      .insert(sampleHostels)
      .select()

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to insert hostels', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Sample hostels added successfully',
      hostels: data 
    })
  } catch (err) {
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
