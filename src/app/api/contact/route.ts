import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema for contact form validation
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
})

// POST /api/contact - Handle contact form submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validation = contactSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = validation.data

    // Log the contact submission (in production, you'd send this to email or save to database)
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    // In a real application, you would:
    // 1. Send an email notification to admin
    // 2. Save to database for tracking
    // 3. Send confirmation email to user
    // 4. Integrate with a CRM or helpdesk system

    // For now, we'll just return success
    return NextResponse.json({
      message: 'Contact form submitted successfully',
      data: {
        name,
        email,
        subject,
        submittedAt: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}

// GET /api/contact - Get contact information (optional)
export async function GET() {
  return NextResponse.json({
    contact: {
      address: 'UPSA Hostel Management Office, University of Professional Studies, Accra, Ghana',
      phone: {
        main: '+233 30 123 4567',
        emergency: '+233 50 890 1234',
      },
      email: {
        general: 'hostel@upsamail.edu.gh',
        support: 'support@upsamail.edu.gh',
      },
      hours: {
        weekdays: '8:00 AM - 6:00 PM',
        saturday: '9:00 AM - 2:00 PM',
        sunday: 'Closed',
      },
    },
  })
}
