import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withRateLimit } from '@/lib/security/rateLimiting'
import { z } from 'zod'

// Schema for announcement validation
const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  category: z.enum(['general', 'payment', 'maintenance', 'academic', 'urgent', 'emergency']),
  targetAudience: z.string().min(1, 'Target audience is required'),
  isActive: z.boolean().default(true),
  priority: z.enum(['low', 'medium', 'high', 'emergency']).default('medium'),
  scheduledFor: z.string().datetime().optional().nullable(),
})

// GET /api/announcements - Fetch announcements
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const category = searchParams.get('category')
    const targetAudience = searchParams.get('targetAudience')
    const isActive = searchParams.get('isActive')

    // Build query using admin client to bypass RLS on users table join
    let query = supabaseAdmin
      .from('announcements')
      .select(`
        *,
        author:users (
          id,
          email,
          profile:profiles (
            first_name,
            last_name
          )
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category) {
      const dbCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
      query = query.eq('category', dbCategory)
    }
    if (targetAudience) {
      const standardAudiences = ['all', 'students', 'staff', 'admin', 'porter', 'director']
      const dbAudience = standardAudiences.includes(targetAudience.toLowerCase())
        ? targetAudience.charAt(0).toUpperCase() + targetAudience.slice(1).toLowerCase()
        : targetAudience // Probably a hostel ID
      query = query.eq('target_audience', dbAudience)
    }
    if (isActive !== null) {
      query = query.eq('is_published', isActive === 'true')
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: announcements, error, count } = await query

    if (error) {
      throw error
    }

    // Process to match frontend expectations
    const processedData = announcements?.map((a: any) => {
      // Supabase might return profile as an array or object depending on join cardinality
      const profileResult = a.author?.profile
      const profile = Array.isArray(profileResult) ? profileResult[0] : profileResult

      const profilesMeta = a.author && profile ? {
        first_name: profile.first_name || 'System',
        last_name: profile.last_name || 'Admin',
        email: a.author.email
      } : {
        first_name: 'System',
        last_name: 'Admin',
        email: 'admin@upsa.edu.gh'
      }

      return {
        ...a,
        status: a.is_published ? 'published' : 'draft',
        scheduled_for: a.publication_date,
        author: `${profilesMeta.first_name} ${profilesMeta.last_name}`,
        creator: profilesMeta,
        date: a.created_at,
        category: a.category?.toLowerCase() || 'general'
      }
    })

    return NextResponse.json({
      data: processedData,
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
    // Get current user from cookie
    const token = request.cookies.get('sb-access-token')?.value || 
                  request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
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

    // Create announcement using admin client
    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        title: validatedData.title,
        content: validatedData.content,
        category: validatedData.category.charAt(0).toUpperCase() + validatedData.category.slice(1).toLowerCase(),
        target_audience: ['all', 'students', 'staff', 'admin', 'porter', 'director'].includes(validatedData.targetAudience.toLowerCase())
          ? validatedData.targetAudience.charAt(0).toUpperCase() + validatedData.targetAudience.slice(1).toLowerCase()
          : validatedData.targetAudience, // Preserve ID
        is_published: validatedData.isActive,
        author_id: user.id,
        priority: validatedData.priority.charAt(0).toUpperCase() + validatedData.priority.slice(1).toLowerCase(),
        publication_date: validatedData.scheduledFor || new Date().toISOString(),
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
