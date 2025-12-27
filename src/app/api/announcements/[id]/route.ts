import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

// Schema for announcement validation (same as route.ts)
const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  category: z.enum(['general', 'payment', 'maintenance', 'academic', 'urgent']),
  targetAudience: z.string().min(1, 'Target audience is required'),
  isActive: z.boolean().default(true),
  priority: z.enum(['low', 'medium', 'high', 'emergency']).default('medium'),
  scheduledFor: z.string().datetime().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: announcement, error } = await supabaseAdmin
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
      .eq('id', params.id)
      .single()

    if (error) throw error

    // Process to match frontend expectations
    const processedAnnouncement = announcement ? {
      ...announcement,
      status: (announcement as any).is_published ? 'published' : 'draft',
      scheduled_for: (announcement as any).publication_date,
      creator: (announcement as any).author && (announcement as any).author.profile ? {
        first_name: (announcement as any).author.profile.first_name,
        last_name: (announcement as any).author.profile.last_name,
        email: (announcement as any).author.email
      } : null
    } : null

    return NextResponse.json({ data: processedAnnouncement })
  } catch (error) {
    console.error('Error fetching announcement:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcement' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user from token
    const token = request.cookies.get('sb-access-token')?.value || 
                  request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission
    const userRole = user.user_metadata?.role
    if (!['admin', 'director'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = announcementSchema.partial().parse(body)

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.content) updateData.content = validatedData.content
    if (validatedData.category) updateData.category = validatedData.category.charAt(0).toUpperCase() + validatedData.category.slice(1).toLowerCase()
    if (validatedData.targetAudience) {
      updateData.target_audience = ['all', 'students', 'staff', 'admin', 'porter', 'director'].includes(validatedData.targetAudience.toLowerCase())
        ? validatedData.targetAudience.charAt(0).toUpperCase() + validatedData.targetAudience.slice(1).toLowerCase()
        : validatedData.targetAudience
    }
    if (validatedData.priority) {
      updateData.priority = validatedData.priority.charAt(0).toUpperCase() + validatedData.priority.slice(1).toLowerCase()
    }
    if (validatedData.isActive !== undefined) updateData.is_published = validatedData.isActive
    if (validatedData.scheduledFor !== undefined) updateData.publication_date = validatedData.scheduledFor

    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: 'Announcement updated successfully',
      data: announcement,
    })
  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user from token
    const token = request.cookies.get('sb-access-token')?.value || 
                  request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission
    const userRole = user.user_metadata?.role
    if (!['admin', 'director'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ message: 'Announcement deleted successfully' })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}
