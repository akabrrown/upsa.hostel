import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Interface for hostel page content
interface HostelPageContent {
  id?: string
  hero_title: string
  hero_subtitle: string
  hero_background_image: string
  hero_button_text: string
  features_title: string
  features_subtitle: string
  features: {
    id: string
    title: string
    description: string
    icon: string
    order: number
  }[]
  cta_title: string
  cta_subtitle: string
  cta_button_text: string
  cta_secondary_button_text: string
  created_at?: string
  updated_at?: string
}

// GET /api/admin/hostel-content - Fetch hostel page content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Fetch specific content by ID
      const { data, error } = await supabase
        .from('hostel_page_content')
        .select('*')
        .eq('id', id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, return null
        return NextResponse.json({ data: null })
      }

      if (error) {
        console.error('Error fetching hostel content:', error)
        return NextResponse.json(
          { error: 'Failed to fetch hostel content' },
          { status: 500 }
        )
      }

      return NextResponse.json({ data })
    } else {
      // Fetch all content or latest content
      const { data, error } = await supabase
        .from('hostel_page_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, return null
        return NextResponse.json({ data: null })
      }

      if (error) {
        console.error('Error fetching hostel content:', error)
        return NextResponse.json(
          { error: 'Failed to fetch hostel content' },
          { status: 500 }
        )
      }

      return NextResponse.json({ data: data?.[0] || null })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/hostel-content - Create new hostel page content
export async function POST(request: NextRequest) {
  try {
    const content: HostelPageContent = await request.json()

    // Validate required fields
    if (!content.hero_title || !content.hero_subtitle || !content.features_title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('hostel_page_content')
      .insert([{
        ...content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating hostel content:', error)
      return NextResponse.json(
        { error: 'Failed to create hostel content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/hostel-content - Update hostel page content
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    const content: Partial<HostelPageContent> = await request.json()

    const { data, error } = await supabase
      .from('hostel_page_content')
      .update({
        ...content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating hostel content:', error)
      return NextResponse.json(
        { error: 'Failed to update hostel content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/hostel-content - Delete hostel page content
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('hostel_page_content')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting hostel content:', error)
      return NextResponse.json(
        { error: 'Failed to delete hostel content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Content deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
