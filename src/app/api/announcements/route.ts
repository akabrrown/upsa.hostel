import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { withRateLimit } from '@/lib/security/rateLimiting'
import { z } from 'zod'

// Schema for announcement validation
const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  category: z.enum(['general', 'payment', 'maintenance', 'academic', 'urgent']),
  targetAudience: z.enum(['all', 'students', 'staff', 'admin', 'porter', 'director']),
  isActive: z.boolean().default(true),
  scheduledFor: z.string().datetime().optional(),
})

// GET /api/announcements - Fetch announcements
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const category = searchParams.get('category')
    const targetAudience = searchParams.get('targetAudience')
    const isActive = searchParams.get('isActive')

    // Build query
    let query = supabase
      .from('announcements')
      .select(`
        *,
        creator:profiles(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    if (targetAudience) {
      query = query.eq('target_audience', targetAudience)
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: announcements, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      data: announcements,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

// POST /api/announcements - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to create announcements
    const userRole = user.user_metadata?.role
    if (!['admin', 'director'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = announcementSchema.parse(body)

    // Create announcement
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        ...validatedData,
        creator_id: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Announcement created successfully',
      data: announcement,
    })
  } catch (error) {
    console.error('Error creating announcement:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
}
