import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUser() {
  const email = '10334595@upsamail.edu.gh'
  
  const { data: user } = await supabase.from('users').select('*, roles(name)').eq('email', email).single()
  if (!user) { console.log('User not found'); return; }
  
  console.log('USER ID:', user.id)
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
  if (profile) {
    Object.keys(profile).forEach(k => console.log('KEY:', k))
  }

  const { data: acc } = await supabase.from('accommodations').select('*').eq('user_id', user.id).eq('is_active', true)
  console.log('ACTIVE ACC COUNT:', acc?.length || 0)

  const { data: pay } = await supabase.from('payments').select('*').eq('user_id', user.id)
  console.log('PAYMENTS COUNT:', pay?.length || 0)
  if (pay?.length) {
    console.log('PAYMENT STATUSES:', pay.map(p => p.status).join(', '))
  }
}

checkUser()
