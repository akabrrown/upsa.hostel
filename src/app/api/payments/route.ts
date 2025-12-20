import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      amount,
      paymentMethod,
      transactionId,
      semester,
      academicYear,
      provider,
      phoneNumber,
      bankName,
      accountNumber
    } = body

    if (!userId || !amount || !paymentMethod || !transactionId || !semester || !academicYear) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }

    // Create payment record
    const { data: paymentRecord, error: dbError } = await supabase
      .from('payment_records')
      .insert({
        student_id: userId,
        amount,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        status: 'pending',
        semester,
        academic_year: academicYear,
        description: 'Hostel accommodation fee',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to save payment record' },
        { status: 500 }
      )
    }

    // If payment was successful, update student accommodation status
    if (paymentRecord.status === 'completed') {
      await supabase
        .from('students')
        .update({ 
          accommodation_status: 'allocated',
          last_payment_date: new Date().toISOString(),
        })
        .eq('user_id', userId)
    }

    return NextResponse.json({
      message: 'Payment processed successfully',
      payment: {
        ...paymentRecord,
        status: paymentRecord.status,
      }
    })

  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('payment_records')
      .select('*, students(first_name, last_name, index_number)')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: payments, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('payment_records')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', userId)

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      }
    })

  } catch (error) {
    console.error('Fetch payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('id')
    const { action } = await request.json()

    if (!paymentId || !action) {
      return NextResponse.json(
        { error: 'Payment ID and action are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'refund':
        const { reason } = await request.json()
        
        if (!reason) {
          return NextResponse.json(
            { error: 'Refund reason is required' },
            { status: 400 }
          )
        }

        // Update payment record
        const { error: updateError } = await supabase
          .from('payment_records')
          .update({
            status: 'refunded',
            refund_reason: reason,
            refunded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentId)

        if (updateError) {
          return NextResponse.json(
            { error: 'Failed to process refund' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Payment refunded successfully',
        })

      case 'cancel':
        // Cancel payment
        const { error: cancelError } = await supabase
          .from('payment_records')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentId)

        if (cancelError) {
          return NextResponse.json(
            { error: 'Failed to cancel payment' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Payment cancelled successfully',
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Payment update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
