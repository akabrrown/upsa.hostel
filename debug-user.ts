import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUser() {
  const email = '10334595@upsamail.edu.gh'
  console.log(`Checking user with email: ${email}`)
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*, roles(name)')
    .eq('email', email)
    .single()
    
  if (userError) {
    console.error('Error fetching user:', userError)
    return
  }
  
  if (user) {
    console.log('--- USER DATA ---')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Role:', user.roles?.name)
    console.log('Index Number (from users table):', user.index_number)
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
    
  if (profile) {
    console.log('--- PROFILE DATA ---')
    console.log('Profile Keys:', Object.keys(profile))
    console.log('First Name:', profile.first_name)
    console.log('Last Name:', profile.last_name)
    console.log('Student ID (from profiles table):', profile.student_id)
    console.log('Accommodation Status:', profile.accommodation_status)
    
    // Check accommodations
    const { data: accommodations } = await supabase
      .from('accommodations')
      .select('*, rooms(room_number, hostels(name))')
      .eq('user_id', user.id)
      .eq('is_active', true)
    console.log('Active Accommodations:', accommodations?.length || 0)
    if (accommodations?.length) console.log(JSON.stringify(accommodations, null, 2))
    
    // Check bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
    console.log('Bookings:', bookings?.length || 0)
    if (bookings?.length) console.log(JSON.stringify(bookings, null, 2))
    
    // Check reservations
    const { data: reservations } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', user.id)
    console.log('Reservations:', reservations?.length || 0)
    if (reservations?.length) console.log(JSON.stringify(reservations, null, 2))
    
    // Check payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
    console.log('Payments:', payments?.length || 0)
    if (payments?.length) console.log(JSON.stringify(payments, null, 2))
    
  } else {
    console.log('No profile found or error:', profileError?.message)
  }
}

checkUser()
