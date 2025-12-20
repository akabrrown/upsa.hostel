import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { withRateLimit } from '@/lib/security/rateLimiting'
import { z } from 'zod'

// Schema for notification validation
const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  type: z.enum(['info', 'success', 'warning', 'error', 'payment', 'booking']),
  userId: z.string().uuid('Invalid user ID'),
  isRead: z.boolean().default(false),
  actionUrl: z.string().url().optional(),
})

// GET /api/notifications - Fetch user notifications
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const type = searchParams.get('type')
    const isRead = searchParams.get('isRead')

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }
    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true')
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: notifications, error, count } = await query

    if (error) {
      throw error
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({
      data: notifications,
      unreadCount: unreadCount || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create new notification
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

    // Check if user has permission to create notifications
    const userRole = user.user_metadata?.role
    if (!['admin', 'director', 'porter'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = notificationSchema.parse(body)

    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        ...validatedData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Notification created successfully',
      data: notification,
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications - Update notification (mark as read, etc.)
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { notificationIds, isRead } = body

    if (!notificationIds || typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Update notifications
    const { data: notifications, error } = await supabase
      .from('notifications')
      .update({ is_read: isRead })
      .in('id', Array.isArray(notificationIds) ? notificationIds : [notificationIds])
      .eq('user_id', user.id)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Notifications updated successfully',
      data: notifications,
    })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const notificationIds = searchParams.get('ids')

    if (!notificationIds) {
      return NextResponse.json(
        { error: 'Notification IDs are required' },
        { status: 400 }
      )
    }

    // Delete notifications
    const { error } = await supabase
      .from('notifications')
      .delete()
      .in('id', notificationIds.split(','))
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Notifications deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting notifications:', error)
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    )
  }
}
